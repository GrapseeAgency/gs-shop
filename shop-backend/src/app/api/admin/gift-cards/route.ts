import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'
import { logError, logInfo } from '@/lib/logger'

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

// POST - Create new gift card with recipient support
export async function POST(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    logInfo('Create gift card - received body', body)
    
    const { 
      code, 
      balance,
      initialBalance,
      userId,
      expiryDate, 
      isActive,
      message,
      design,
      // Recipient fields
      recipientEmail,
      recipientName,
      senderName,
      sendEmail,
    } = body

    if (!code || balance === undefined) {
      return NextResponse.json({ error: 'Code and balance are required' }, { status: 400 })
    }

    const initialBal = initialBalance || balance

    const giftCard = await prisma.giftCard.create({
      data: {
        code: code.toUpperCase(),
        balance: Number(balance),
        initialBalance: Number(initialBal),
        userId: userId || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        message: message || null,
        design: design || 'classic',
        // Recipient info
        recipientEmail: recipientEmail || null,
        recipientName: recipientName || null,
        senderName: senderName || null,
        sendEmail: sendEmail || false,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Gift card created successfully',
      giftCard
    })
  } catch (error: any) {
    logError('Create gift card', error)
    return NextResponse.json({ 
      error: 'Failed to create gift card',
      details: error.message,
      code: error.code 
    }, { status: 500 })
  }
}
