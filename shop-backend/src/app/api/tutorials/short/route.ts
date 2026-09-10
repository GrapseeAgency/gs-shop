// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tutorials = await prisma.course.findMany({
    where: { type: 'short' },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tutorials)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, duration, price, videoUrl, description, tags } = body
  
  const tutorial = await prisma.course.create({
    data: {
      title,
      description,
      price,
      duration,
      videoUrl,
      tags,
      type: 'short',
      rating: 0
    }
  })
  
  return NextResponse.json(tutorial)
}
