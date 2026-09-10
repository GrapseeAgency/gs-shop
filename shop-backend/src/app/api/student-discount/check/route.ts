import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for existing verification
    const verification = await prisma.studentVerification.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!verification) {
      return NextResponse.json({
        verified: false,
        status: 'not_started',
        message: 'Student verification not started',
      })
    }

    return NextResponse.json({
      verified: verification.status === 'verified',
      status: verification.status,
      method: verification.verificationMethod,
      discountPercentage: verification.status === 'verified' ? 15 : 0,
      expiresAt: verification.verifiedAt,
      message: verification.status === 'verified'
        ? 'Student discount active (15% off)'
        : verification.status === 'pending'
        ? 'Verification pending review'
        : 'Verification rejected',
    })
  } catch (error) {
    console.error('Error checking student status:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
