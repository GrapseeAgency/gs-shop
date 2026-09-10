import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - List all gift cards
export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const giftCards = await prisma.giftCard.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, count: giftCards.length, giftCards })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gift cards' }, { status: 500 })
  }
}

// POST - Create new gift card
export async function POST(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { code, balance, userId, expiryDate, isActive } = body

    if (!code || balance === undefined) {
      return NextResponse.json({ error: 'Code and balance are required' }, { status: 400 })
    }

    const giftCard = await prisma.giftCard.create({
      data: {
        code: code.toUpperCase(),
        balance: Number(balance),
        userId: userId || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Gift card created successfully',
      giftCard
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create gift card' }, { status: 500 })
  }
}
