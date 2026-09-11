import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to access your wallet.' },
        { status: 401 }
      )
    }

    const wallet = await db.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!wallet) {
      // Auto-create wallet if it doesn't exist
      const newWallet = await db.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: 'BDT',
        },
        include: {
          transactions: true,
        },
      })
      return NextResponse.json({ data: newWallet })
    }

    return NextResponse.json({ data: wallet })
  } catch (error) {
    console.error('[WALLET_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if wallet already exists for this user
    const existing = await db.wallet.findUnique({
      where: { userId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Wallet already exists for this user' },
        { status: 409 }
      )
    }

    const wallet = await db.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: 'BDT',
      },
    })

    return NextResponse.json({ data: wallet }, { status: 201 })
  } catch (error) {
    console.error('[WALLET_POST]', error)
    return NextResponse.json(
      { error: 'Failed to create wallet' },
      { status: 500 }
    )
  }
}
