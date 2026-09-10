import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get micro-investment settings
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ enabled: false, roundUps: [] })
    }

    const settings = await prisma.microInvestment.findUnique({
      where: { userId }
    })

    const roundUps = await prisma.roundUp.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const totalInvested = roundUps.reduce((sum, r) => sum + r.amount, 0)

    return NextResponse.json({
      enabled: settings?.enabled || false,
      multiplier: settings?.multiplier || 1,
      totalInvested,
      roundUps,
      investedIn: settings?.investmentType || 'index-fund',
      returns: settings?.returns || 0
    })
  } catch (error) {
    console.error('Micro-investment error:', error)
    return NextResponse.json({ enabled: false })
  }
}

// POST - Update micro-investment settings
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enabled, multiplier, investmentType } = await req.json()

    await prisma.microInvestment.upsert({
      where: { userId },
      update: {
        enabled,
        multiplier,
        investmentType,
        updatedAt: new Date()
      },
      create: {
        userId,
        enabled,
        multiplier: multiplier || 1,
        investmentType: investmentType || 'index-fund'
      }
    })

    return NextResponse.json({
      success: true,
      enabled,
      message: enabled
        ? `Micro-investment enabled! Spare change will be invested in ${investmentType}.`
        : 'Micro-investment disabled.'
    })
  } catch (error) {
    console.error('Micro-investment update error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Process round-up from purchase
export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { orderTotal } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.microInvestment.findUnique({
      where: { userId }
    })

    if (!settings?.enabled) {
      return NextResponse.json({ processed: false, reason: 'not_enabled' })
    }

    // Calculate round-up
    const nextRound = Math.ceil(orderTotal / 10) * 10
    const roundUpAmount = (nextRound - orderTotal) * settings.multiplier

    if (roundUpAmount > 0) {
      await prisma.roundUp.create({
        data: {
          userId,
          orderId: 'mock-order-' + Date.now(),
          orderTotal,
          roundUpTo: nextRound,
          amount: roundUpAmount,
          investedIn: settings.investmentType
        }
      })

      return NextResponse.json({
        processed: true,
        roundUpAmount,
        message: `${roundUpAmount} invested from this purchase!`
      })
    }

    return NextResponse.json({ processed: false, reason: 'no_round_up' })
  } catch (error) {
    console.error('Round-up error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
