import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const programs = await prisma.certificationProgram.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(programs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, description, exams } = body
  
  const program = await prisma.certificationProgram.create({
    data: {
      title,
      description,
      exams: JSON.stringify(exams || [])
    }
  })
  
  return NextResponse.json(program)
}
