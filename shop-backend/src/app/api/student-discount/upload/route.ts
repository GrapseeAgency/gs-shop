import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { verificationId, documentUrl } = body

    if (!verificationId || !documentUrl) {
      return NextResponse.json(
        { error: 'Verification ID and document URL required' },
        { status: 400 }
      )
    }

    // Find the verification
    const verification = await prisma.studentVerification.findFirst({
      where: {
        id: verificationId,
        userId: session.user.id,
      },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      )
    }

    // Update with document
    await prisma.studentVerification.update({
      where: { id: verificationId },
      data: {
        idDocumentUrl: documentUrl,
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully. Pending review.',
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
