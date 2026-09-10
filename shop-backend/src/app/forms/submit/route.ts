import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { formId, responses, respondentInfo } = body
  
  const submission = await prisma.formSubmission.create({
    data: {
      formId,
      data: JSON.stringify(responses),
      respondentEmail: respondentInfo?.email,
      respondentName: respondentInfo?.name
    }
  })
  
  // Update form response count
  await prisma.form.update({
    where: { id: formId },
    data: { responses: { increment: 1 } }
  })
  
  return NextResponse.json({
    submissionId: submission.id,
    message: 'Form submitted successfully',
    thankYouMessage: 'Thank you for your submission!'
  })
}
