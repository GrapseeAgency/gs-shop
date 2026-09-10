import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// POST /api/newsletter Newsletter subscription with duplicate check
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check for duplicate
    const existing = await prisma.newsletter.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (!existing.isActive) {
        // Reactivate subscription
        await prisma.newsletter.update({
          where: { email: normalizedEmail },
          data: { isActive: true },
        })
        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
          discountCode: 'WELCOME10',
        })
      }
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
        discountCode: 'WELCOME10',
        alreadySubscribed: true,
      })
    }

    // Create new subscription
    await prisma.newsletter.create({
      data: { email: normalizedEmail },
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      discountCode: 'WELCOME10',
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
