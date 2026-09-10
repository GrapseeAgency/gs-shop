import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const templates = await prisma.digitalProduct.findMany({
    where: { category: 'template' },
    orderBy: { sales: 'desc' }
  })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, category, previewUrl, downloadUrl, techStack } = body
  
  const template = await prisma.digitalProduct.create({
    data: {
      name,
      description,
      price,
      category: 'template',
      previewUrl,
      downloadUrl,
      techStack,
      sales: 0,
      rating: 0,
      reviews: 0
    }
  })
  
  return NextResponse.json(template)
}
