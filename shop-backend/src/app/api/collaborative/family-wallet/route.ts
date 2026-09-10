// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get family wallet details
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wallet = await prisma.familyWallet.findFirst({
      where: { ownerId: userId }
    })

    if (!wallet) {
      return NextResponse.json({ wallet: null, members: [] })
    }

    const members = await prisma.familyWalletMember.findMany({
      where: { walletId: wallet.id },
      include: { user: { select: { name: true, avatar: true, email: true } } }
    })

    return NextResponse.json({
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        currency: 'INR'
      },
      members,
      transactions: [], // Would fetch from Transaction model
      spendingLimits: {}
    })
  } catch (error) {
    console.error('Family wallet error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Create or manage family wallet
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, memberEmail, limit, amount } = await req.json()

    if (action === 'create') {
      const wallet = await prisma.familyWallet.create({
        data: {
          ownerId: userId,
          balance: 0,
          currency: 'INR'
        }
      })

      return NextResponse.json({
        success: true,
        wallet,
        message: 'Family wallet created! Add members to share expenses.'
      })
    }

    if (action === 'add_member' && memberEmail) {
      const member = await prisma.user.findUnique({
        where: { email: memberEmail }
      })

      if (!member) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const wallet = await prisma.familyWallet.findFirst({
        where: { ownerId: userId }
      })

      if (!wallet) {
        return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
      }

      await prisma.familyWalletMember.create({
        data: {
          walletId: wallet.id,
          userId: member.id,
          role: 'member',
          spendingLimit: limit || 5000
        }
      })

      return NextResponse.json({
        success: true,
        message: `${member.name} added to family wallet`
      })
    }

    if (action === 'add_funds' && amount) {
      const wallet = await prisma.familyWallet.findFirst({
        where: { ownerId: userId }
      })

      if (!wallet) {
        return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
      }

      await prisma.familyWallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } }
      })

      return NextResponse.json({
        success: true,
        message: `${amount} added to family wallet`,
        newBalance: wallet.balance + amount
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Family wallet action error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
