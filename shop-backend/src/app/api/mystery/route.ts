import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Daily claims tracking in-memory (or we can use database check)
const dailyClaims = new Map<string, string[]>()
const rewardHistory: Array<{ id: string; reward: string; type: string; date: string; value: number }> = []

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || 'guest'

    const today = new Date().toISOString().split('T')[0]
    const claimedToday = dailyClaims.get(userId)?.includes(today) || false
    const userHistory = rewardHistory.slice(-10)

    // Query SpinPrize database records
    const dbPrizes = await prisma.spinPrize.findMany({
      where: { isActive: true }
  })

    const prizes = dbPrizes.length > 0 ? dbPrizes : [
      { id: '1', name: '50 Points', type: 'points', value: 50, probability: 30, color: '#EAB308', isActive: true },
      { id: '2', name: '10% Off Coupon', type: 'coupon', value: 10, probability: 20, color: '#3B82F6', isActive: true },
      { id: '3', name: 'Free Cloud Setup', type: 'free_shipping', value: 0, probability: 18, color: '#10B981', isActive: true }, // Rename to digital
      { id: '4', name: '100 Points', type: 'points', value: 100, probability: 15, color: '#F59E0B', isActive: true },
      { id: '5', name: '500 Wallet Credit', type: 'gift_card', value: 500, probability: 10, color: '#EC4899', isActive: true }, // Translate to BDT
      { id: '6', name: '200 Points', type: 'points', value: 200, probability: 5, color: '#8B5CF6', isActive: true },
      { id: '7', name: '25% Off Coupon', type: 'coupon', value: 25, probability: 1.5, color: '#EF4444', isActive: true },
      { id: '8', name: 'JACKPOT 5000!', type: 'jackpot', value: 5000, probability: 0.5, color: '#FFD700', isActive: true } // Translate to BDT
    ]

    return NextResponse.json({
      success: true,
      canClaim: !claimedToday,
      nextClaimTime: claimedToday ? new Date(new Date().setHours(24, 0, 0, 0)).toISOString() : null,
      rewardHistory: userHistory,
      possibleRewards: prizes.map(p => ({
        type: p.type,
        name: p.name,
        label: p.name,
        value: p.value,
        probability: p.probability,
        color: p.color || 'text-violet-500',
        icon: p.type === 'points' ? 'Star' : p.type === 'coupon' ? 'CreditCard' : p.type === 'free_shipping' ? 'Cloud' : 'Gift'
      })),
      dailyLimit: 1
    })
  } catch (error) {
    console.error('[MYSTERY-API] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load mystery reward data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required to spin or claim rewards' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    const userClaims = dailyClaims.get(userId) || []

    if (userClaims.includes(today)) {
      return NextResponse.json({
        success: false,
        error: 'Already claimed today',
        nextClaimTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
      }, { status: 400 })
    }

    // Query SpinPrize database records for weighted random selection
    const dbPrizes = await prisma.spinPrize.findMany({
      where: { isActive: true }
  })

    const prizes = dbPrizes.length > 0 ? dbPrizes : [
      { id: '1', name: '50 Points', type: 'points', value: 50, probability: 30, color: '#EAB308', isActive: true },
      { id: '2', name: '10% Off Coupon', type: 'coupon', value: 10, probability: 20, color: '#3B82F6', isActive: true },
      { id: '3', name: 'Free Cloud Setup', type: 'free_shipping', value: 0, probability: 18, color: '#10B981', isActive: true },
      { id: '4', name: '100 Points', type: 'points', value: 100, probability: 15, color: '#F59E0B', isActive: true },
      { id: '5', name: '500 Wallet Credit', type: 'gift_card', value: 500, probability: 10, color: '#EC4899', isActive: true },
      { id: '6', name: '200 Points', type: 'points', value: 200, probability: 5, color: '#8B5CF6', isActive: true },
      { id: '7', name: '25% Off Coupon', type: 'coupon', value: 25, probability: 1.5, color: '#EF4444', isActive: true },
      { id: '8', name: 'JACKPOT 5000!', type: 'jackpot', value: 5000, probability: 0.5, color: '#FFD700', isActive: true }
    ]

    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0)
    let cumulative = 0
    let selectedPrize = prizes[0]

    for (const prize of prizes) {
      cumulative += prize.probability
      if (Math.random() <= cumulative) {
        selectedPrize = prize
        break
      }
    }

    // Mark as claimed
    userClaims.push(today)
    dailyClaims.set(userId, userClaims)

    const rewardRecord = {
      id: null,
      reward: selectedPrize.name,
      label: selectedPrize.name,
      type: selectedPrize.type,
      value: selectedPrize.value,
      date: today,
    }
    rewardHistory.push(rewardRecord)

    // === PERSIST RWARDS TO DATABASE ===
    if (selectedPrize.type === 'points') {
      const addedPoints = Number(selectedPrize.value)
      await prisma.user.update({
        where: { id: userId },
        data: { rewardsPoints: { increment: addedPoints } },
      })
    } else if (selectedPrize.type === 'gift_card' || selectedPrize.type === 'jackpot') {
      const creditAmt = Number(selectedPrize.value)
      // Credits user wallet
      const wallet = await prisma.wallet.findUnique({ where: { userId } })
      if (wallet) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: creditAmt } },
        })
        // Log wallet transaction
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: creditAmt,
            type: 'credit',
            description: `Won ${selectedPrize.name} from Mystery Wheel!`
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      reward: {
        ...selectedPrize,
        ...rewardRecord,
        color: selectedPrize.color || 'text-violet-500',
        icon: selectedPrize.type === 'points' ? 'Star' : selectedPrize.type === 'coupon' ? 'CreditCard' : selectedPrize.type === 'free_shipping' ? 'Cloud' : 'Gift'
      },
      message: `You won ${selectedPrize.name}! `,
    })
  } catch (error) {
    console.error('[MYSTERY-API] POST Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to claim mystery reward' }, { status: 500 })
  }
}
