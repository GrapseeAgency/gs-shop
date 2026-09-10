import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Static contact information
const CONTACT_INFO = {
  email: 'support@grapsee.shop',
  phone: '+880 1712-345678',
  phoneSecondary: '+880 1812-345678',
  address: 'House 45, Road 11, Gulshan-2, Dhaka 1212, Bangladesh',
  hours: {
    weekdays: '10:00 AM - 9:00 PM (Saturday - Thursday)',
    friday: '3:00 PM - 9:00 PM (Friday)',
  },
  social: {
    facebook: 'https://facebook.com/grapsee',
    twitter: 'https://twitter.com/grapsee',
    instagram: 'https://instagram.com/grapsee',
    linkedin: 'https://linkedin.com/company/grapsee',
    youtube: 'https://youtube.com/@grapsee',
  },
  supportChannels: [
    { type: 'email', label: 'Email Support', value: 'support@grapsee.shop', responseTime: 'Within 2 hours' },
    { type: 'phone', label: 'Phone Support', value: '+880 1712-345678', responseTime: 'Immediate (business hours)' },
    { type: 'chat', label: 'Live Chat', value: 'Available on website', responseTime: 'Instant' },
    { type: 'social', label: 'Social Media', value: '@grapsee on all platforms', responseTime: 'Within 4 hours' },
  ],
  faq: [
    { question: 'What are your shipping options?', answer: 'We offer Standard, Express, Same Day delivery, and Store Pickup.' },
    { question: 'How do I track my order?', answer: 'Go to Orders section and click on Track Order, or use the tracking number sent to your email.' },
    { question: 'What is your return policy?', answer: 'We offer 30-day returns for most products. Digital services have a 7-day refund window.' },
    { question: 'How do I use a coupon code?', answer: 'Enter your coupon code during checkout in the promo code field.' },
  ],
}

// Generate a ticket ID
function generateTicketId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'TK-'
  for (let i = 0; i < 6; i++) {
  }
  return result
}

export async function GET() {
  try {
    return NextResponse.json({
      contact: CONTACT_INFO,
    })
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message, phone } = body as {
      name: string
      email: string
      subject?: string
      message: string
      phone?: string
    }

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name is required and must be at least 2 characters' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message is required and must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Generate ticket ID
    const ticketId = generateTicketId()

    // Save to Contact table
    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || `Contact Form: ${ticketId}`,
        message: message.trim(),
      },
    })

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Your message has been received. We will respond within 2 hours.',
      contactId: contact.id,
      estimatedResponseTime: '2 hours',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
}
