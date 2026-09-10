import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const programs = await prisma.certificationProgram.findMany({
    orderBy: { title: 'asc' }
  })
  return NextResponse.json(programs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, description, exams } = body
  
  const certification = await prisma.certification.create({
    data: {
      title,
      description
    }
  })
  
  return NextResponse.json(certification)
}
