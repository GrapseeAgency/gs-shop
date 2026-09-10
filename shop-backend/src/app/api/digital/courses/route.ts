// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { students: 'desc' }
  })
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, description, price, duration, lessons, instructor, level, thumbnail } = body
  
  const course = await prisma.course.create({
    data: {
      title,
      description,
      price,
      duration,
      lessons,
      instructor,
      level,
      thumbnail,
      students: 0,
      rating: 0,
      re    }
  })
  
  return NextResponse.json(course)
}
