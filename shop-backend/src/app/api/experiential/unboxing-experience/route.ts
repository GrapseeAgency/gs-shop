// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get unboxing experience for order
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Generate unboxing story
    const items = order.items
    const totalItems = items.length
    const totalValue = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

    const story = generateUnboxingStory(items, totalValue)
    const revealSequence = items.map((item, index) => ({
      step: index + 1,
      revealDelay: (index + 1) * 2, // seconds
      product: item.product,
      hint: getHint(item.product?.name || '')
    }))

    return NextResponse.json({
      orderId,
      totalItems,
      totalValue,
      story,
      revealSequence,
      unboxingType: totalItems > 5 ? 'treasure_hunt' : 'classic',
      estimatedTime: totalItems * 2 + 5,
      features: [
        'AR reveal overlay',
        'Haptic feedback',
        'Voice narration',
        'Collectible stickers'
      ]
    })
  } catch (error) {
    console.error('Unboxing error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function generateUnboxingStory(items: any[], totalValue: number) {
  const intro = totalValue > 10000 
    ? 'A treasure awaits inside...'
    : totalValue > 5000
    ? 'Something special is waiting for you...'
    : 'Your package has arrived!'

  const itemDescriptions = items.map(item => {
    const product = item.product
    if (!product) return null
    return `${item.quantity}x ${product.name}`
  }).filter(Boolean)

  return {
    intro,
    chapters: [
      {
        title: 'The Box Arrives',
        description: 'Your carefully packed order has reached you safely.',
        duration: 5
      },
      {
        title: 'First Peek',
        description: `Inside, you'll find ${items.length} item${items.length > 1 ? 's' : ''} waiting to be discovered.`,
        duration: 3
      },
      ...itemDescriptions.map((desc, i) => ({
        title: `Reveal ${i + 1}`,
        description: desc,
        duration: 5,
        surprise: i === items.length - 1 && totalValue > 5000
      }))
    ],
    finale: totalValue > 10000
      ? 'Premium unboxing complete! Share your experience?'
      : ' Unboxing complete! Enjoy your new items!'
  }
}

function getHint(productName: string): string {
  const hints: Record<string, string> = {
    'shoe': 'Something for your feet...',
    'shirt': 'Something to wear...',
    'phone': 'Something smart...',
    'laptop': 'Something powerful...',
    'watch': 'Something timeless...'
  }
  
  for (const [key, hint] of Object.entries(hints)) {
    if (productName.toLowerCase().includes(key)) return hint
  }
  
  return 'Something special...'
}
