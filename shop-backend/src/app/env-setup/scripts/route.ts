import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const scripts = await prisma.digitalProduct.findMany({
    where: { category: 'env-setup' },
    orderBy: { downloads: 'desc' }
  })
  return NextResponse.json(scripts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, command, os, includes, setupTime } = body
  
  const script = await prisma.digitalProduct.create({
    data: {
      name,
      description,
      price,
      category: 'env-setup',
      command,
      os,
      downloads: 0,
      sales: 0,
      rating: 0
    }
  })
  
  return NextResponse.json(script)
}
