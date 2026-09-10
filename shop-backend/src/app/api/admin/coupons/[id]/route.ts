import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - Get specific coupon
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id }
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, coupon })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 })
  }
}

// PUT - Update coupon
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { code, description, discountType, discountValue, minOrderAmount, maxUses, usedCount, startDate, endDate, isActive, appliesTo, appliesToIds } = body

    const updateData: any = {}
    if (code !== undefined) updateData.code = code.toUpperCase()
    if (description !== undefined) updateData.description = description
    if (discountType !== undefined) updateData.discountType = discountType
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue)
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount ? Number(minOrderAmount) : null
    if (maxUses !== undefined) updateData.maxUses = maxUses ? Number(maxUses) : null
    if (usedCount !== undefined) updateData.usedCount = Number(usedCount)
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    if (appliesTo !== undefined) updateData.appliesTo = appliesTo
    if (appliesToIds !== undefined) updateData.appliesToIds = JSON.stringify(appliesToIds)

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon: {
        ...coupon,
        appliesToIds: coupon.appliesToIds ? JSON.parse(coupon.appliesToIds) : null,
      }
    })
  } catch (error) {
    console.error('Update coupon error:', error)
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

// DELETE - Delete coupon
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.coupon.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}
