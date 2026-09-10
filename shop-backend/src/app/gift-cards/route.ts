import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments: string[] = []
  for (let s = 0; s < 4; s++) {
    let segment = ''
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    segments.push(segment)
  }
  return segments.join('-')
}

export async function GET() {
  try {
    const giftCards = await db.giftCard.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: giftCards })
  } catch (error) {
    console.error('[GIFT_CARDS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch gift cards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, design, message } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'A valid positive amount is required' },
        { status: 400 }
      )
    }

    const validDesigns = ['classic', 'birthday', 'holiday', 'premium']
    const cardDesign = validDesigns.includes(design) ? design : 'classic'

    const code = generateGiftCardCode()

    const giftCard = await db.giftCard.create({
      data: {
        code,
        amount,
        balance: amount,
        design: cardDesign,
        message: message || null,
      },
    })

    return NextResponse.json({ data: giftCard }, { status: 201 })
  } catch (error) {
    console.error('[GIFT_CARDS_POST]', error)
    return NextResponse.json(
      { error: 'Failed to create gift card' },
      { status: 500 }
    )
  }
}
