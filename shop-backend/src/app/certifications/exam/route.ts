import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const certId = searchParams.get('certId')
  
  if (!certId) {
    return NextResponse.json({ error: 'Certification ID required' }, { status: 400 })
  }
  
  const exam = await prisma.certificationExam.findFirst({
    where: { certificationId: certId }
  })
  
  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }
  
  return NextResponse.json(exam)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, certId, answers } = body
  
  const score = Math.floor(Math.random() * 30) + 70
  const passed = score >= 70
  
  const result = await prisma.certificationResult.create({
    data: {
      userId,
      examId: certId,
      score,
      passed
    }
  })
  
  return NextResponse.json({
    resultId: result.id,
    score,
    passed,
    certificateUrl: passed ? `/certificates/${result.id}.pdf` : null
  })
}
