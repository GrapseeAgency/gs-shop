import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Start or continue negotiation
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, message, sessionId } = await req.json()

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate AI response
    const aiResponse = generateNegotiationResponse(message, product, sessionId)

    // Store conversation
    const newMessage = { user: message, ai: aiResponse.message, timestamp: new Date() }
    
    let session
    if (sessionId) {
      const existing = await prisma.negotiationSession.findUnique({ where: { id: sessionId } })
      const existingMessages = existing?.messages || []
      session = await prisma.negotiationSession.update({
        where: { id: sessionId },
        data: {
          messages: [...(Array.isArray(existingMessages) ? existingMessages : []), newMessage],
          currentOffer: aiResponse.offer,
          status: aiResponse.isFinal ? 'completed' : 'active'
        }
      })
    } else {
      session = await prisma.negotiationSession.create({
        data: {
          userId,
          productId,
          sellerId: product.sellerId,
          messages: [newMessage],
          originalPrice: product.price,
          currentOffer: aiResponse.offer,
          status: 'active'
        }
      })
    }

    return NextResponse.json({
      sessionId: session.id,
      message: aiResponse.message,
      currentOffer: aiResponse.offer,
      savings: (product.price - aiResponse.offer).toFixed(2),
      discountPercent: Math.round(((product.price - aiResponse.offer) / product.price) * 100),
      isFinal: aiResponse.isFinal,
      canAccept: aiResponse.canAccept,
      tips: aiResponse.tips
    })
  } catch (error) {
    console.error('Negotiator error:', error)
    return NextResponse.json({ error: 'Negotiation failed' }, { status: 500 })
  }
}

// GET - Get negotiation history
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      const session = await prisma.negotiationSession.findUnique({
        where: { id: sessionId }
      })
      return NextResponse.json({ session })
    }

    // Get user's negotiation history
    const sessions = await prisma.negotiationSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Negotiation history error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

function generateNegotiationResponse(userMessage: string, product: any, sessionId: string | null) {
  const price = product.price
  const minPrice = price * 0.85 // 15% max discount
  const messages = sessionId ? [] : [] // Would fetch history
  const attemptCount = messages.length

  const lowerCaseMsg = userMessage.toLowerCase()
  
  // Check if user is asking for discount
  const askingForDiscount = 
    lowerCaseMsg.includes('discount') ||
    lowerCaseMsg.includes('cheaper') ||
    lowerCaseMsg.includes('lower price') ||
    lowerCaseMsg.includes('deal') ||
    lowerCaseMsg.includes('offer')

  // Check if user mentions budget
  const budgetMention = lowerCaseMsg.match(/(\d+)/)
  const userBudget = budgetMention ? parseInt(budgetMention[1]) : 0

  let offer = price
  let message = ''
  let isFinal = false
  let canAccept = false

  if (!askingForDiscount && attemptCount === 0) {
    message = `Hi! I'm the AI assistant for ${product.seller.name}. I see you're interested in ${product.name}. Would you like to discuss the price? I have some flexibility!`
  } else if (userBudget > 0 && userBudget >= minPrice) {
    offer = userBudget
    message = `That's a reasonable offer! I can accept $${userBudget} for this ${product.name}. That's a ${Math.round(((price - userBudget) / price) * 100)}% discount!`
    isFinal = true
    canAccept = true
  } else if (userBudget > 0 && userBudget < minPrice) {
    offer = minPrice
    message = `I understand your budget is $${userBudget}, but the lowest I can go is $${minPrice.toFixed(2)}. This is already a ${Math.round(((price - minPrice) / price) * 100)}% discount. Would that work for you?`
    isFinal = true
    canAccept = true
  } else if (attemptCount === 0) {
    offer = price * 0.95 // 5% off
    message = `I can offer you a special discount! How about $${offer.toFixed(2)} instead of $${price.toFixed(2)}? That's 5% off!`
  } else if (attemptCount === 1) {
    offer = price * 0.90 // 10% off
    message = `Let me see what I can do... I can offer $${offer.toFixed(2)}. That's a 10% discount! This is a quality product from ${product.seller.name}.`
  } else {
    offer = minPrice
    message = `This is my final offer: $${minPrice.toFixed(2)} (15% off). I can't go lower than this, but I assure you it's a great deal for the quality you're getting!`
    isFinal = true
    canAccept = true
  }

  return {
    message,
    offer,
    isFinal,
    canAccept,
    tips: [
      'Be specific about your budget',
      'Mention if you\'re buying multiple items',
      'Ask about bundle deals'
    ]
  }
}
