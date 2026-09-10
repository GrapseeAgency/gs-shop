import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - Fetch a single gift card
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } }
    })
    if (!giftCard) return NextResponse.json({ error: 'Gift card not found' }, { status: 404 })

    return NextResponse.json({ success: true, giftCard })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gift card' }, { status: 500 })
  }
}

// PUT - Update a gift card
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { 
      code, 
      balance, 
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

    const updateFields: any = {}
    if (code !== undefined) updateFields.code = code.toUpperCase()
    if (balance !== undefined) updateFields.balance = Number(balance)
    if (userId !== undefined) updateFields.userId = userId || null
    if (expiryDate !== undefined) updateFields.expiryDate = expiryDate ? new Date(expiryDate) : null
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive)
    if (message !== undefined) updateFields.message = message
    if (design !== undefined) updateFields.design = design
    // Recipient fields
    if (recipientEmail !== undefined) updateFields.recipientEmail = recipientEmail
    if (recipientName !== undefined) updateFields.recipientName = recipientName
    if (senderName !== undefined) updateFields.senderName = senderName
    if (sendEmail !== undefined) updateFields.sendEmail = Boolean(sendEmail)

    const giftCard = await prisma.giftCard.update({
      where: { id },
      data: updateFields
    })

    return NextResponse.json({ success: true, message: 'Gift card updated', giftCard })
  } catch (error) {
    console.error('Update gift card error:', error)
    return NextResponse.json({ error: 'Failed to update gift card' }, { status: 500 })
  }
}

// DELETE - Delete a gift card
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'delete')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.giftCard.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Gift card deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete gift card' }, { status: 500 })
  }
}
