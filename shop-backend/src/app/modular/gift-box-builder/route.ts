import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get gift box builder data
export async function GET(req: NextRequest) {
  try {
    // Get gift-eligible products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        tags: { contains: 'gift' }
      },
      take: 50
    })

    // Box options
    const boxes = [
      { id: 'standard', name: 'Standard Box', price: 199, color: '#8B4513' },
      { id: 'premium', name: 'Premium Box', price: 399, color: '#1B1B1B' },
      { id: 'luxury', name: 'Luxury Box', price: 699, color: '#C9A961' },
      { id: 'eco', name: 'Eco Box', price: 149, color: '#228B22' }
    ]

    // Wrapping options
    const wrapping = [
      { id: 'classic', name: 'Classic Wrap', price: 99 },
      { id: 'elegant', name: 'Elegant Silk', price: 199 },
      { id: 'rustic', name: 'Rustic Kraft', price: 79 },
      { id: 'festive', name: 'Festive', price: 149 }
    ]

    // Card templates
    const cards = [
      { id: 'birthday', name: 'Birthday', template: 'Happy Birthday! Wishing you...' },
      { id: 'anniversary', name: 'Anniversary', template: 'Happy Anniversary to you both...' },
      { id: 'thankyou', name: 'Thank You', template: 'Thank you so much for...' },
      { id: 'custom', name: 'Custom', template: '' }
    ]

    return NextResponse.json({
      products,
      boxes,
      wrapping,
      cards,
      maxItems: 8,
      previewEnabled: true
    })
  } catch (error) {
    console.error('Gift box builder error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Build and save gift box
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { items, box, wrapping: wrapOption, card, message, recipient } = await req.json()

    // Calculate total
    const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const boxPrice = box?.price || 0
    const wrapPrice = wrapOption?.price || 0
    const cardPrice = 49
    const total = itemsTotal + boxPrice + wrapPrice + cardPrice

    const giftBox = {
      items,
      box,
      wrapping: wrapOption,
      card: {
        ...card,
        customMessage: message
      },
      recipient,
      pricing: {
        itemsTotal,
        boxPrice,
        wrapPrice,
        cardPrice,
        total
      }
    }

    // Save if user is logged in (mock)
    if (userId) {
      // Gift box saved mock
    }

    return NextResponse.json({
      success: true,
      giftBox,
      preview: {
        description: `Beautiful ${box?.name} containing ${items.length} items, wrapped in ${wrapOption?.name}`,
        estimatedDelivery: '2-3 business days'
      },
      checkoutUrl: `/checkout?giftBox=true`,
      message: 'Your gift box is ready! Preview and checkout when ready.'
    })
  } catch (error) {
    console.error('Gift box save error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
