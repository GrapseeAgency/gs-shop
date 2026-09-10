// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const snippets = await prisma.digitalProduct.findMany({
    where: {},
    orderBy: { downloads: 'desc' }
  })
  return NextResponse.json(snippets)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, language, code, documentation } = body
  
  const snippet = await prisma.digitalProduct.create({
    data: {
      name,
      description,
      price,
            language,
      code,
      documentation,
      downloads: 0,
      sales: 0,
      rating: 0
    }
  })
  
  return NextResponse.json(snippet)
}
