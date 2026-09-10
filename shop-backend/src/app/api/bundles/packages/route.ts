import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const bundles = await prisma.bundle.findMany({
    orderBy: { bundlePrice: 'asc' }
  })
  return NextResponse.json(bundles)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, bundlePrice, originalTotal, productIds, savings, savingsPercent } = body
  
  const bundle = await prisma.bundle.create({
    data: {
      name,
      description,
      bundlePrice,
      originalTotal,
      productIds,
      savings,
      savingsPercent
    }
  })
  
  return NextResponse.json(bundle)
}
