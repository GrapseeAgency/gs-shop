// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Process voice command
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { transcript, command } = await req.json()

    // Parse voice command
    const parsed = parseVoiceCommand(transcript || command)

    if (!parsed.action) {
      return NextResponse.json({
        understood: false,
        message: 'I didn\'t understand that. Try saying "Order laptop stand" or "Add headphones to cart"',
        suggestions: [
          'Order [product name]',
          'Add [product] to cart',
          'Show me [category]',
          'What\'s on sale?'
        ]
      })
    }

    // Execute command
    let result: any = {}

    switch (parsed.action) {
      case 'order':
      case 'buy':
        // Search for product
        const product = await findProduct(parsed.product)
        if (product) {
          result = {
            action: 'add_to_cart',
            product,
            message: `Found ${product.name}. Added to your cart!`,
            quickCheckout: true
          }
        } else {
          result = {
            action: 'search',
            query: parsed.product,
            message: `I couldn't find "${parsed.product}". Here are similar products.`,
            alternatives: await searchAlternatives(parsed.product)
          }
        }
        break

      case 'add':
        const addProduct = await findProduct(parsed.product)
        if (addProduct) {
          result = {
            action: 'add_to_cart',
            product: addProduct,
            message: `Added ${addProduct.name} to cart`
          }
        }
        break

      case 'search':
      case 'show':
        const searchResults = await prisma.product.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: parsed.product } },
              { description: { contains: parsed.product } } // Use description instead of category
            ]
          },
          take: 5
        })
        result = {
          action: 'search_results',
          query: parsed.product,
          results: searchResults,
          message: `Found ${searchResults.length} results for "${parsed.product}"`
        }
        break

      case 'cart':
        result = {
          action: 'show_cart',
          message: 'Opening your cart',
          redirect: '/cart'
        }
        break

      case 'deals':
      case 'sale':
        const deals = await prisma.product.findMany({
          where: { 
            isActive: true,
            comparePrice: { not: null }
          },
          take: 5
        })
        result = {
          action: 'show_deals',
          deals,
          message: `Here are ${deals.length} great deals right now!`
        }
        break

      default:
        result = {
          action: 'unknown',
          message: 'I can help you order products, search, or check deals. What would you like to do?'
        }
    }

    // Log voice interaction
    if (userId) {
      await prisma.voiceShoppingLog.create({
        data: {
          userId,
          transcript: transcript || command,
          understood: !!parsed.action,
          action: parsed.action || 'unknown',
          success: !!result.product || !!result.results
        }
      }).catch(() => {})
    }

    return NextResponse.json({
      understood: true,
      parsed,
      ...result
    })
  } catch (error) {
    console.error('Voice shopping error:', error)
    return NextResponse.json({ 
      understood: false,
      message: 'Sorry, I had trouble processing that. Please try again.'
    }, { status: 500 })
  }
}

// GET - Get voice command history
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ history: [] })
    }

    const history = await prisma.voiceShoppingLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Voice history error:', error)
    return NextResponse.json({ history: [] })
  }
}

function parseVoiceCommand(text: string) {
  const lower = text.toLowerCase()
  
  // Order/Buy patterns
  if (lower.match(/(order|buy|purchase|get me|i want)/)) {
    const product = lower
      .replace(/(order|buy|purchase|get me|i want|a|an|some)\s+/g, '')
      .trim()
    return { action: 'order', product }
  }
  
  // Add to cart
  if (lower.match(/(add|put).*(cart|bag)/)) {
    const product = lower
      .replace(/(add|put|to|my|cart|bag|the|a|an)\s+/g, '')
      .trim()
    return { action: 'add', product }
  }
  
  // Search/Show
  if (lower.match(/(show|find|search|look for|where is)/)) {
    const product = lower
      .replace(/(show|find|search|look for|where is|me|the|a|an)\s+/g, '')
      .trim()
    return { action: 'search', product }
  }
  
  // Cart
  if (lower.match(/(cart|bag|checkout|what.*in.*cart)/)) {
    return { action: 'cart' }
  }
  
  // Deals/Sales
  if (lower.match(/(deal|sale|discount|offer|promotion|what.*on sale)/)) {
    return { action: 'deals' }
  }
  
  return { action: null, text: lower }
}

async function findProduct(query: string) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        name: { contains: query }
      }
    },
    take: 1
  })
  return products[0] || null
}

async function searchAlternatives(query: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { tags: { contains: query } },
        { description: { contains: query } }
      ]
    },
    take: 3
  })
}
