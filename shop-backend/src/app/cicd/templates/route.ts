import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const templates = await prisma.digitalProduct.findMany({
    where: { category: 'cicd' },
    orderBy: { downloads: 'desc' }
  })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, platform, yaml, documentation } = body
  
  const template = await prisma.digitalProduct.create({
    data: {
      name,
      description,
      price,
      category: 'cicd',
      downloads: 0,
      sales: 0,
      rating: 0
    }
  })
  
  return NextResponse.json(template)
}
