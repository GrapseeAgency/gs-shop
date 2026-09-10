import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Analyze hair and recommend products
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { tags: { contains: 'hair' } },
          { tags: { contains: 'haircare' } },
        ]
      },
      take: 8
    })

    return NextResponse.json({
      success: true,
      analysis: null,
      recommendations: products,
      message: 'Hair analysis requires vision API integration',
    })
  } catch (error) {
    console.error('Hair analyzer error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
