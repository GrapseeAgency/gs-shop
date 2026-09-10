// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, template, data, sections } = body
  
  const resume = await prisma.resume.create({
    data: {
      userId,
      template,
      data: JSON.stringify(data),
      sections,
      pdfUrl: `/resumes/${Date.now()}.pdf`,
      status: 'generated'
    }
  })
  
  return NextResponse.json({
    resumeId: resume.id,
    downloadUrl: resume.pdfUrl,
    previewUrl: `/api/resume/preview/${resume.id}`,
    message: 'Resume generated successfully'
  })
}
