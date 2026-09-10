import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const products = await prisma.digitalProduct.findMany({
    orderBy: { sales: 'desc' }
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, category, downloadUrl, previewUrl, tags } = body
  
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
      reviews: 0
    }
  })
  
  return NextResponse.json(product)
}
