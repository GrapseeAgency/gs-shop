import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const reports = await prisma.auditReport.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(reports)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { url, type, email } = body
  
  const report = await prisma.auditReport.create({
    data: {
      url,
      type,
      email,
      status: 'pending',
      score: 0,
      pdfUrl: null
    }
  })
  
  return NextResponse.json({
    reportId: report.id,
    status: 'pending',
    message: 'Audit started. Report will be emailed shortly.'
  })
}
