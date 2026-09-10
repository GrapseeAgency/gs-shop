import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get treasure hunt status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Get unfound treasures (using isFound field)
    const treasures = await prisma.treasureHunt.findMany({
      where: {
        isFound: false
      }
    })

    // Get user's found treasures
    const userFound = userId ? await prisma.treasureHunt.findMany({
      where: { 
        userId: userId,
        isFound: true 
      }
    }) : []

    return NextResponse.json({
      activeTreasures: treasures.map(t => ({
        id: t.id,
        clue: t.clue,
        // Don't send the actual answer!
      })),
      foundCount: userFound.length,
      totalAvailable: treasures.length,
      leaderboard: []
    })
  } catch (error) {
    console.error('Treasure hunt error:', error)
    return NextResponse.json({ error: 'Failed to load hunt' }, { status: 500 })
  }
}

// POST - Claim treasure
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { answer } = await req.json()

    // Find treasure by answer (checking all unfound treasures)
    const treasures = await prisma.treasureHunt.findMany({
      where: {
        isFound: false
      }
    })

    const treasure = treasures.find(t => 
      t.answer.toUpperCase() === answer?.toUpperCase()
    )

    if (!treasure) {
      return NextResponse.json({ 
        error: 'Invalid answer or already claimed',
        hint: 'Keep searching! Check product pages and checkout flows.'
      }, { status: 400 })
    }

    // Mark as found
    await prisma.treasureHunt.update({
      where: { id: treasure.id },
      data: {
        isFound: true,
        foundAt: new Date()
      }
    })

    // Create coupon with reward value
    const couponCode = `TREASURE${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    await prisma.coupon.create({
      data: {
        code: couponCode,
        discount: treasure.rewardValue,
        discountValue: treasure.rewardValue,
        type: 'percentage',
        maxUses: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    // Award points
    await prisma.user.update({
      where: { id: userId },
      data: { rewardsPoints: { increment: 50 } }
    })

    return NextResponse.json({
      success: true,
      message: `Treasure found!`,
      reward: {
        couponCode,
        discount: treasure.rewardValue,
        points: 50
      }
    })
  } catch (error) {
    console.error('Treasure claim error:', error)
    return NextResponse.json({ error: 'Failed to claim' }, { status: 500 })
  }
}
