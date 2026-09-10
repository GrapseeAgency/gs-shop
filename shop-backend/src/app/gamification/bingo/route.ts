import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Services', 'Digital', 'Books', 'Sports', 'Beauty']

// GET - Get user's bingo card
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create bingo card
    let card = await prisma.bingoCard.findFirst({
      where: { userId }
    })

    if (!card) {
      // Generate new card with random categories
      const grid = generateBingoGrid()
      card = await prisma.bingoCard.create({
        data: {
          userId,
          card: JSON.stringify(grid),
          marked: '[]'
        }
      })
    }

    // Check user's purchases against grid
    const userOrders = await prisma.order.findMany({
      where: {
        items: {
          some: {}
        }
      },
      include: { items: { include: { product: { include: { category: true } } } } }
    })

    const purchasedCategories = new Set(
      userOrders.flatMap(o => 
        o.items.map(i => i.product?.category?.name)
      ).filter(Boolean)
    )

    const grid = JSON.parse(card.grid)
    let marked = JSON.parse(card.marked || '[]')
    
    // Auto-mark completed categories
    grid.forEach((cell: any, index: number) => {
      if (cell !== 'FREE' && purchasedCategories.has(cell) && !marked.includes(index)) {
        marked.push(index)
      }
    })

    // Check for completed lines
    const completed = checkBingoLines(marked)

    // Update if changes
    if (marked.length !== JSON.parse(card.card || '[]').length) {
      await prisma.bingoCard.update({
        where: { id: card.id },
        data: { card: JSON.stringify(marked) }
      })
    }

    return NextResponse.json({
      grid,
      marked,
      completed,
      progress: {
        marked: marked.length,
        total: 24, // 5x5 minus FREE center
        percent: Math.round((marked.length / 24) * 100)
      },
      rewards: getRewardsForCompleted(completed)
    })
  } catch (error) {
    console.error('Bingo error:', error)
    return NextResponse.json({ error: 'Failed to load bingo' }, { status: 500 })
  }
}

// POST - Claim bingo reward
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lineType } = await req.json()

    const card = await prisma.bingoCard.findFirst({
      where: { userId }
    })

    if (!card) {
      return NextResponse.json({ error: 'No bingo card' }, { status: 404 })
    }

    const completed = card.isCompleted ? JSON.parse(card.card || '[]') : []
    
    if (completed.includes(lineType)) {
      return NextResponse.json({ error: 'Already claimed' }, { status: 400 })
    }

    // Mark as claimed
    await prisma.bingoCard.update({
      where: { id: card.id },
      data: { isCompleted: true, completedAt: new Date() }
    })

    // Award reward
    const reward = generateReward(lineType)
    
    await prisma.coupon.create({
      data: {
        code: reward.code,
        discount: reward.discount,
        discountValue: reward.discount,
        type: 'percentage',
        maxUses: 1,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    })

    // Award points
    await prisma.user.update({
      where: { id: userId },
      data: { rewardsPoints: { increment: reward.points } }
    })

    return NextResponse.json({
      success: true,
      lineType,
      reward
    })
  } catch (error) {
    console.error('Bingo claim error:', error)
    return NextResponse.json({ error: 'Failed to claim' }, { status: 500 })
  }
}

function generateBingoGrid() {
  // 5x5 grid with FREE center
  const shuffled = [...CATEGORIES].sort(() => Math.random() - 0.5)
  const grid = []
  
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      grid.push('FREE')
    } else {
      grid.push(shuffled[i % shuffled.length])
    }
  }
  
  return grid
}

function checkBingoLines(marked: number[]) {
  const completed = []
  
  // Check rows
  for (let row = 0; row < 5; row++) {
    const rowIndices = [row * 5, row * 5 + 1, row * 5 + 2, row * 5 + 3, row * 5 + 4]
    if (rowIndices.every(i => marked.includes(i) || i === 12)) {
      completed.push(`row-${row}`)
    }
  }
  
  // Check columns
  for (let col = 0; col < 5; col++) {
    const colIndices = [col, col + 5, col + 10, col + 15, col + 20]
    if (colIndices.every(i => marked.includes(i) || i === 12)) {
      completed.push(`col-${col}`)
    }
  }
  
  // Check diagonals
  const diag1 = [0, 6, 12, 18, 24]
  const diag2 = [4, 8, 12, 16, 20]
  
  if (diag1.every(i => marked.includes(i) || i === 12)) {
    completed.push('diag-1')
  }
  if (diag2.every(i => marked.includes(i) || i === 12)) {
    completed.push('diag-2')
  }
  
  return completed
}

function getRewardsForCompleted(completed: string[]) {
  const rewards: Record<string, any> = {
    'row-0': { name: 'Top Row', discount: 5, points: 25 },
    'row-1': { name: 'Second Row', discount: 5, points: 25 },
    'row-2': { name: 'Middle Row', discount: 10, points: 50 },
    'row-3': { name: 'Fourth Row', discount: 5, points: 25 },
    'row-4': { name: 'Bottom Row', discount: 5, points: 25 },
    'col-0': { name: 'First Column', discount: 5, points: 25 },
    'col-1': { name: 'Second Column', discount: 5, points: 25 },
    'col-2': { name: 'Middle Column', discount: 10, points: 50 },
    'col-3': { name: 'Fourth Column', discount: 5, points: 25 },
    'col-4': { name: 'Last Column', discount: 5, points: 25 },
    'diag-1': { name: 'Diagonal', discount: 15, points: 75 },
    'diag-2': { name: 'Anti-Diagonal', discount: 15, points: 75 },
    'fullhouse': { name: 'FULL HOUSE!', discount: 30, points: 200 }
  }
  
  return completed.map(c => rewards[c]).filter(Boolean)
}

function generateReward(lineType: string) {
  const rewards: Record<string, any> = {
    'row-0': { code: 'BINGO-R1', discount: 5, points: 25 },
    'row-1': { code: 'BINGO-R2', discount: 5, points: 25 },
    'row-2': { code: 'BINGO-R3', discount: 10, points: 50 },
    'row-3': { code: 'BINGO-R4', discount: 5, points: 25 },
    'row-4': { code: 'BINGO-R5', discount: 5, points: 25 },
    'col-0': { code: 'BINGO-C1', discount: 5, points: 25 },
    'col-1': { code: 'BINGO-C2', discount: 5, points: 25 },
    'col-2': { code: 'BINGO-C3', discount: 10, points: 50 },
    'col-3': { code: 'BINGO-C4', discount: 5, points: 25 },
    'col-4': { code: 'BINGO-C5', discount: 5, points: 25 },
    'diag-1': { code: 'BINGO-D1', discount: 15, points: 75 },
    'diag-2': { code: 'BINGO-D2', discount: 15, points: 75 }
  }
  
  return rewards[lineType] || { code: 'BINGO', discount: 5, points: 25 }
}
