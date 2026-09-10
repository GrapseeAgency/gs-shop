import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/email-subscribe Create an email subscriber
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, source, preferences } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Validate source
    const validSources = ['homepage', 'checkout', 'popup', 'footer', 'referral', 'blog', 'product_page']
    if (source && !validSources.includes(source)) {
      return NextResponse.json(
        { error: `Invalid source. Must be one of: ${validSources.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate preferences format
    const defaultPreferences = {
      deals: true,
      newArrivals: true,
      weekly: false,
      blog: false,
    }

    const subscriberPreferences = preferences
      ? { ...defaultPreferences, ...preferences }
      : defaultPreferences

    // Check if already subscribed (try DB first, then Newsletter table)
    let existingSubscriber = null
    try {
      existingSubscriber = await prisma.emailSubscriber.findUnique({
        where: { email: normalizedEmail },
      })
    } catch {
      // Table might not exist yet, try Newsletter
    }

    // Also check Newsletter table for existing subscribers
    let existingNewsletter = null
    try {
      existingNewsletter = await prisma.newsletter.findUnique({
        where: { email: normalizedEmail },
      })
    } catch {
      // Newsletter table issue
    }

    // If already an active subscriber
    if (existingSubscriber?.isActive) {
      return NextResponse.json({
        success: true,
        subscriber: {
          email: existingSubscriber.email,
          isActive: true,
          name: existingSubscriber.name,
        },
        message: 'You are already subscribed!',
        alreadySubscribed: true,
      })
    }

    // If previously unsubscribed, reactivate
    if (existingSubscriber && !existingSubscriber.isActive) {
      try {
        await prisma.emailSubscriber.update({
          where: { email: normalizedEmail },
          data: {
            isActive: true,
            name: name || existingSubscriber.name,
            source: source || existingSubscriber.source,
            preferences: JSON.stringify(subscriberPreferences),
          },
        })
      } catch {
        // Fallback
      }

      return NextResponse.json({
        success: true,
        subscriber: {
          email: normalizedEmail,
          isActive: true,
          name: name || existingSubscriber.name,
        },
        message: 'Welcome back! Your subscription has been reactivated.',
        reactivated: true,
      })
    }

    // Create new subscriber in EmailSubscriber table
    try {
      await prisma.emailSubscriber.create({
        data: {
          email: normalizedEmail,
          name: name || null,
          source: source || null,
          preferences: JSON.stringify(subscriberPreferences),
          isActive: true,
        },
      })
    } catch (createError) {
      // If unique constraint or table doesn't exist, try Newsletter as fallback
      console.error('EmailSubscriber create error:', createError)
      try {
        if (!existingNewsletter) {
          await prisma.newsletter.create({
            data: {
              email: normalizedEmail,
              isActive: true,
            },
          })
        }
      } catch {
        // Final fallback - both tables might have issues
      }
    }

    // Welcome bonus: give 50 points if user exists
    let welcomeBonus = 0
    try {
      const user = await prisma.user.findFirst({
        where: { email: normalizedEmail },
      })
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { rewardsPoints: { increment: 50 } },
        })
        welcomeBonus = 50
      }
    } catch {
      // User might not exist
    }

    return NextResponse.json({
      success: true,
      subscriber: {
        email: normalizedEmail,
        isActive: true,
        name: name || null,
      },
      welcomeBonus,
      message: welcomeBonus > 0
        ? `Successfully subscribed! You earned ${welcomeBonus} bonus points!`
        : 'Successfully subscribed! Welcome to Grapsee Shop.',
    }, { status: 201 })
  } catch (error) {
    console.error('Email subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
