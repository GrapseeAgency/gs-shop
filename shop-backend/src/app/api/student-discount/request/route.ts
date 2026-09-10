import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, method } = body

    if (!email || !method) {
      return NextResponse.json(
        { error: 'Email and verification method required' },
        { status: 400 }
      )
    }

    // Check if already verified
    const existing = await prisma.studentVerification.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['approved', 'pending'] },
      },
    })

    if (existing?.status === 'approved') {
      return NextResponse.json({
        success: false,
        error: 'Already verified',
        message: 'You already have an active student discount',
      })
    }

    if (existing?.status === 'pending') {
      return NextResponse.json({
        success: false,
        error: 'Pending verification',
        message: 'Your verification is already pending review',
      })
    }

    // Create new verification request
    const verification = await prisma.studentVerification.create({
      data: {
        userId: session.user.id,
        universityEmail: email,
        verificationMethod: method, // 'email', 'unidays', 'manual'
        status: method === 'email' ? 'pending' : 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      message: method === 'email'
        ? 'Verification email sent. Please check your inbox.'
        : 'Please upload your student ID to complete verification.',
      verificationId: verification.id,
    })
  } catch (error) {
    console.error('Error creating verification request:', error)
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    )
  }
}
