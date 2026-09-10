import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const courses = await prisma.digitalProduct.findMany({
    where: { category: 'course' },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, pages, lessons } = body
  
  const course = await prisma.digitalProduct.create({
    data: {
      name,
      description,
      price,
      category: 'course',
      pages,
      lessons: JSON.stringify(lessons),
      sales: 0,
      rating: 0,
      reviews: 0
    }
  })
  
  return NextResponse.json(course)
}
