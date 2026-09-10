import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - WhatsApp commerce bot integration
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, message, action } = await req.json()
    const userId = req.headers.get('x-user-id')

    // Handle different WhatsApp actions
    if (action === 'connect') {
      // WhatsApp connection mock

      return NextResponse.json({
        success: true,
        message: 'WhatsApp connected! You can now browse and buy via WhatsApp.',
        commands: [
          { command: 'browse', description: 'Browse products' },
          { command: 'search [query]', description: 'Search products' },
          { command: 'cart', description: 'View cart' },
          { command: 'order', description: 'Place order' },
          { command: 'track', description: 'Track orders' },
          { command: 'deals', description: 'View current deals' }
        ]
      })
    }

    if (action === 'process_message') {
      // Process natural language message
      const response = processWhatsAppMessage(message)

      // Get products if search query
      let products = []
      if (response.type === 'search') {
        products = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: response.query } },
              { description: { contains: response.query } }
            ]
          },
          take: 5
        })
      }

      return NextResponse.json({
        success: true,
        response: response.message,
        type: response.type,
        products,
        suggestedActions: response.actions
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('WhatsApp error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function processWhatsAppMessage(message: string) {
  const lowerMsg = message.toLowerCase()

  if (lowerMsg.includes('browse') || lowerMsg.includes('products')) {
    return {
      type: 'browse',
      message: 'Here are some trending products for you!',
      actions: ['View categories', 'Trending now', 'New arrivals']
    }
  }

  if (lowerMsg.includes('search') || lowerMsg.includes('find')) {
    const query = message.replace(/search|find/gi, '').trim()
    return {
      type: 'search',
      query,
      message: `Searching for "${query}"...`,
      actions: ['Show results', 'Filter by price', 'Sort by rating']
    }
  }

  if (lowerMsg.includes('cart')) {
    return {
      type: 'cart',
      message: 'Here is your current cart:',
      actions: ['Checkout', 'Continue shopping', 'Clear cart']
    }
  }

  if (lowerMsg.includes('track') || lowerMsg.includes('order')) {
    return {
      type: 'orders',
      message: 'Your recent orders:',
      actions: ['View all orders', 'Track shipment', 'Cancel order']
    }
  }

  if (lowerMsg.includes('deal') || lowerMsg.includes('sale')) {
    return {
      type: 'deals',
      message: ' Hot deals right now!',
      actions: ['Flash sale', 'Bundle offers', 'Clearance']
    }
  }

  // Default response
  return {
    type: 'help',
    message: 'Hi! I can help you:\n Browse products\n Search items\n View cart\n Track orders\n Find deals\n\nWhat would you like to do?',
    actions: ['Browse', 'Search', 'My Orders']
  }
}
