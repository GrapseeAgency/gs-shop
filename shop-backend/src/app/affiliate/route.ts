import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// In-memory store for affiliate registrations (no Affiliate model in Prisma)
const affiliateRegistrations = new Map<string, {
  id: string
  name: string
  email: string
  referralCode: string
  status: string
  registeredAt: string
}>()

const commissionTiers = [
  {
    id: 'tier-bronze',
    name: 'Bronze',
    minSales: 0,
    maxSales: 499,
    commissionRate: 5,
    badge: '',
    color: '#CD7F32',
    benefits: ['5% commission on all sales', 'Basic analytics dashboard', 'Monthly payouts', 'Email support'],
  },
  {
    id: 'tier-silver',
    name: 'Silver',
    minSales: 500,
    maxSales: 2499,
    commissionRate: 8,
    badge: '',
    color: '#C0C0C0',
    benefits: ['8% commission on all sales', 'Advanced analytics', 'Bi-weekly payouts', 'Priority email support', 'Custom referral links'],
  },
  {
    id: 'tier-gold',
    name: 'Gold',
    minSales: 2500,
    maxSales: 9999,
    commissionRate: 12,
    badge: '',
    color: '#FFD700',
    benefits: ['12% commission on all sales', 'Premium analytics + reports', 'Weekly payouts', 'Dedicated affiliate manager', 'Early access to new products', 'Bonus campaigns'],
  },
  {
    id: 'tier-platinum',
    name: 'Platinum',
    minSales: 10000,
    maxSales: 49999,
    commissionRate: 15,
    badge: '',
    color: '#E5E4E2',
    benefits: ['15% commission on all sales', 'Real-time analytics', 'Daily payouts', 'Personal affiliate manager', 'Exclusive product previews', 'Co-branded marketing materials', 'VIP events access'],
  },
  {
    id: 'tier-diamond',
    name: 'Diamond',
    minSales: 50000,
    maxSales: null,
    commissionRate: 20,
    badge: '',
    color: '#B9F2FF',
    benefits: ['20% commission on all sales', 'Full analytics suite', 'Instant payouts', 'Executive affiliate manager', 'Revenue sharing opportunities', 'White-label options', 'Annual retreat invitation', 'Custom landing pages'],
  },
]

const programInfo = { cookieDuration: 30, minimumPayout: 50 }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

        const userStats = {
      referralCode: userId ? `GRAPSEE-${userId.slice(0, 6).toUpperCase()}` : 'GRAPSEE-DEMO01',
      referralLink: `https://grapsee.shop/ref/${userId || 'demo01'}`,
      currentTier: 'silver',
      totalSales: 1250,
      totalEarnings: 187.5,
      totalClicks: 3420,
      conversionRate: 3.65,
      pendingCommission: 42.0,
      paidCommission: 145.5,
      referralsCount: 23,
      monthlyBreakdown: [
        { month: 'Jan 2025', sales: 180, earnings: 14.4 },
        { month: 'Feb 2025', sales: 220, earnings: 17.6 },
        { month: 'Mar 2025', sales: 310, earnings: 24.8 },
        { month: 'Apr 2025', sales: 290, earnings: 23.2 },
        { month: 'May 2025', sales: 250, earnings: 20.0 },
      ],
      recentReferrals: [
        { name: 'Alex M.', amount: 2999, commission: 239.92, date: '2025-03-05' },
        { name: 'Jordan P.', amount: 1499, commission: 119.92, date: '2025-03-04' },
        { name: 'Sam K.', amount: 899, commission: 71.92, date: '2025-03-03' },
      ],
    }

    return NextResponse.json({
      success: true,
      commissionTiers,
      programInfo: {
        name: 'Grapsee Affiliate Program',
        description: 'Earn commissions by referring customers to Grapsee Shop',
        cookieDuration: programInfo.cookieDuration,
        minimumPayout: programInfo.minimumPayout,
        payoutMethods: ['Bank Transfer', 'PayPal', 'Grapsee Wallet'],
        payoutSchedule: 'Net-15',
        termsUrl: '/terms',
      },
      stats: [],
      userStats,
      isRegistered: userId ? affiliateRegistrations.has(userId) : false,
    })
  } catch (error) {
    console.error('[AFFILIATE] GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch affiliate program info' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, website, socialMedia, howHeard } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Check for duplicate registration
    const existingReg = Array.from(affiliateRegistrations.values()).find(
      (r) => r.email === email
    )
    if (existingReg) {
      return NextResponse.json(
        { success: false, error: 'This email is already registered as an affiliate' },
        { status: 409 }
      )
    }

    // Generate referral code
    const referralCode = `GRAPSEE-${name.slice(0, 3).toUpperCase()}${Date.now().toString(36).toUpperCase()}`

    const registration = {
      id: `aff-${Date.now()}`,
      name,
      email,
      referralCode,
      status: 'pending_review',
      registeredAt: new Date().toISOString(),
    }

    affiliateRegistrations.set(email, registration)

    return NextResponse.json({
      success: true,
      message: 'Affiliate registration submitted successfully! We\'ll review your application within 24-48 hours.',
      registration: {
        id: registration.id,
        name: registration.name,
        email: registration.email,
        referralCode: registration.referralCode,
        status: registration.status,
        registeredAt: registration.registeredAt,
        referralLink: `https://grapsee.shop/ref/${registration.referralCode}`,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('[AFFILIATE] POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register for affiliate program' },
      { status: 500 }
    )
  }
}
