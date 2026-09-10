// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const schemas = await prisma.digitalProduct.findMany({
    where: {},
    orderBy: { downloads: 'desc' }
  })
  return NextResponse.json(schemas)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, schema, database, tables, relations } = body
  
  const dbSchema = await prisma.digitalProduct.create({
    data: {
      name,
      description,
      price,
            schema,
      database,
      tables,
      relations,
      downloads: 0,
      sales: 0
    }
  })
  
  return NextResponse.json(dbSchema)
}
