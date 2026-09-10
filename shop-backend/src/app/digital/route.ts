import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const digitalProducts = await prisma.digitalProduct.findMany({
    where: { 
      category: { in: ['template', 'ui-kit', 'snippet', 'course', 'guide', 'cicd', 'notion', 'database-schema', 'env-setup'] }
    },
    orderBy: { sales: 'desc' }
  })
  
  const categories = await prisma.digitalProduct.groupBy({
    by: ['category'],
    _count: { category: true }
  })
  
  return NextResponse.json({
    products: digitalProducts,
    categories: categories.map(c => ({
      name: c.category,
      count: c._count.category
    })),
    total: digitalProducts.length
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, category, downloadUrl, previewUrl, tags, metadata } = body
  
  const product = await prisma.digitalProduct.create({
    data: {
      name,
      description,
      price,
      category,
      downloadUrl,
      previewUrl,
      tags,
      sales: 0,
      rating: 0,
      reviews: 0,
      downloads: 0
    }
  })
  
  return NextResponse.json(product)
}
