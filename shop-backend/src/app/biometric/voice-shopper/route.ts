import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Process voice shopping commands
export async function POST(req: NextRequest) {
  try {
    const { audioData, transcribedText, command } = await req.json()
    const userId = req.headers.get('x-user-id')

    // Process voice command
    const processedCommand = processVoiceCommand(transcribedText || command)

    let response = {}

    switch (processedCommand.type) {
      case 'search':
        const products = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: processedCommand.query } },
              { description: { contains: processedCommand.query } }
            ]
          },
          take: 5
        })
        response = {
          type: 'search_results',
          query: processedCommand.query,
          products,
          speak: `Found ${products.length} products for ${processedCommand.query}`
        }
        break

      case 'add_to_cart':
        response = {
          type: 'cart_action',
          action: 'add',
          product: processedCommand.product,
          speak: `Added ${processedCommand.product} to your cart`
        }
        break

      case 'checkout':
        response = {
          type: 'checkout',
          speak: 'Proceeding to checkout',
          redirect: '/checkout'
        }
        break

      case 'track_order':
        response = {
          type: 'order_status',
          speak: 'Your recent orders are being retrieved',
          orders: []
        }
        break

      default:
        response = {
          type: 'help',
          speak: 'I can help you search products, add to cart, checkout, or track orders. What would you like to do?',
          suggestions: ['Search for shoes', 'Add to cart', 'Track my order', 'Go to checkout']
        }
    }

    return NextResponse.json({
      success: true,
      command: processedCommand,
      response,
      voiceEnabled: true
    })
  } catch (error) {
    console.error('Voice shopper error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function processVoiceCommand(text: string) {
  const lower = text.toLowerCase()

  // Search patterns
  if (lower.includes('search') || lower.includes('find') || lower.includes('looking for')) {
    const query = text.replace(/search for|find|looking for|i need|i want/gi, '').trim()
    return { type: 'search', query }
  }

  // Add to cart
  if (lower.includes('add') && lower.includes('cart')) {
    const product = text.replace(/add|to|cart|my/gi, '').trim()
    return { type: 'add_to_cart', product }
  }

  // Checkout
  if (lower.includes('checkout') || lower.includes('buy now') || lower.includes('pay')) {
    return { type: 'checkout' }
  }

  // Track order
  if (lower.includes('track') || lower.includes('where is') || lower.includes('order status')) {
    return { type: 'track_order' }
  }

  return { type: 'unknown', raw: text }
}
