import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'
import { logError, logInfo } from '@/lib/logger'

// GET - List all coupons
export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, count: coupons.length, coupons })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

// POST - Create new coupon
export async function POST(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    logInfo('Create coupon - received body', body)
    
    const { code, description, discountType, discountValue, minOrderAmount, maxUses, startDate, endDate, isActive, appliesTo, appliesToIds } = body

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Code, discountType, and discountValue are required' }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description: description || '',
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        usedCount: 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        appliesTo: appliesTo || 'all',
        appliesToIds: appliesToIds ? JSON.stringify(appliesToIds) : null,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      coupon: {
        ...coupon,
        appliesToIds: coupon.appliesToIds ? JSON.parse(coupon.appliesToIds) : null,
      }
    })
  } catch (error: any) {
    logError('Create coupon', error)
    return NextResponse.json({ 
      error: 'Failed to create coupon',
      details: error.message,
      code: error.code
    }, { status: 500 })
  }
}
