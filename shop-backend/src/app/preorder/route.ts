import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) where.status = status

    let preorders = await prisma.preorder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    if (preorders.length === 0) {
      preorders = [] as any
    }

    const result = preorders.map((po: any) => ({
      ...po,
      bonusIncluded: typeof po.bonusIncluded === 'string'
        ? JSON.parse(po.bonusIncluded)
        : po.bonusIncluded,
      availability: po.maxPreorders ? po.maxPreorders - po.preorderedCount : null,
      depositPercent: Math.round((po.depositAmount / po.fullPrice) * 100),
      daysUntilRelease: Math.max(0, Math.ceil(
        (new Date(po.estimatedDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )),
    }))

    return NextResponse.json({ preorders: result, total: result.length })
  } catch (error) {
    console.error('Preorder list error:', error)
    return NextResponse.json(
      { preorders: [].map(po => ({
        ...po,
        bonusIncluded: JSON.parse(po.bonusIncluded),
        availability: po.maxPreorders ? po.maxPreorders - po.preorderedCount : null,
        depositPercent: Math.round((po.depositAmount / po.fullPrice) * 100),
        daysUntilRelease: Math.max(0, Math.ceil(
          (new Date(po.estimatedDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )),
      })), total: [].length },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productName, customerEmail, quantity } = body

    if (!productId || !productName || !customerEmail) {
      return NextResponse.json(
        { error: 'productId, productName, and customerEmail are required' },
        { status: 400 }
      )
    }

    // Find the preorder
    const preorder = await prisma.preorder.findFirst({
      where: { productId, status: 'open' },
    })

    if (!preorder) {
      return NextResponse.json(
        { error: 'No open preorder found for this product' },
        { status: 404 }
      )
    }

    if (preorder.maxPreorders && preorder.preorderedCount >= preorder.maxPreorders) {
      return NextResponse.json(
        { error: 'Preorder limit reached for this product' },
        { status: 400 }
      )
    }

    // Increment preordered count
    const updated = await prisma.preorder.update({
      where: { id: preorder.id },
      data: { preorderedCount: preorder.preorderedCount + 1 },
    })

    return NextResponse.json({
      success: true,
      preorder: {
        id: updated.id,
        productName: updated.productName,
        depositAmount: updated.depositAmount,
        fullPrice: updated.fullPrice,
        estimatedDate: updated.estimatedDate,
        status: 'confirmed',
        message: 'Preorder placed successfully',
      },
    })
  } catch (error) {
    console.error('Preorder create error:', error)
    return NextResponse.json(
      { error: 'Failed to create preorder' },
      { status: 500 }
    )
  }
}
