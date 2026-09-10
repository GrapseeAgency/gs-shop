// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const guides = await prisma.digitalProduct.findMany({
    where: {},
    orderBy: { sales: 'desc' }
  })
  return NextResponse.json(guides)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, pages, format, topics, downloadUrl } = body
  
  const guide = await prisma.digitalProduct.create({
    data: {
      name,
      description,
      price,
            pages,
      format,
      topics,
      downloadUrl,
      sales: 0,
      rating: 0,
      re    }
  })
  
  return NextResponse.json(guide)
}
