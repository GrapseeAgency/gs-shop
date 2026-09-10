import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const uiKits = await prisma.digitalProduct.findMany({
    where: { category: 'ui-kit' },
    orderBy: { sales: 'desc' }
  })
  return NextResponse.json(uiKits)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, format, componentCount, previewUrl, downloadUrl } = body
  
  const kit = await prisma.digitalProduct.create({
    data: {
      name,
      description,
      price,
      category: 'ui-kit',
      format,
      componentCount,
      previewUrl,
      downloadUrl,
      sales: 0,
      rating: 0,
      reviews: 0
    }
  })
  
  return NextResponse.json(kit)
}
