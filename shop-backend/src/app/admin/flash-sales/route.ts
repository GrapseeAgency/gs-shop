import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - List all flash sales
export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const flashSales = await prisma.flashSale.findMany({
      include: {
        product: {
          select: { id: true, name: true, imageUrl: true, price: true }
        }
      },
      orderBy: { startTime: 'desc' }
    })

    return NextResponse.json({ success: true, count: flashSales.length, flashSales })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch flash sales' }, { status: 500 })
  }
}

// POST - Create new flash sale
export async function POST(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { productId, salePrice, startTime, endTime, maxQuantity, isActive } = body

    if (!productId || salePrice === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: 'productId, salePrice, startTime, and endTime are required' }, { status: 400 })
    }

    const flashSale = await prisma.flashSale.create({
      data: {
        name: `Flash Sale - ${new Date().toISOString()}`,
        product: {
          connect: { id: productId as string }
        },
        salePrice: Number(salePrice),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        maxQuantity: maxQuantity ? Number(maxQuantity) : null,
        soldCount: 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Flash sale created successfully',
      flashSale
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create flash sale' }, { status: 500 })
  }
}
