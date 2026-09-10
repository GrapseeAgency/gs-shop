import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, title, fields, settings } = body
  
  const form = await prisma.form.create({
    data: {
      userId,
      title,
      fields: JSON.stringify(fields),
      settings: JSON.stringify(settings),
      formUrl: `/forms/${Date.now()}`,
      status: 'active',
      responses: 0
    }
  })
  
  return NextResponse.json({
    formId: form.id,
    formUrl: form.formUrl,
    embedCode: `<iframe src="${form.formUrl}" width="100%" height="600"></iframe>`,
    message: 'Form created successfully'
  })
}
