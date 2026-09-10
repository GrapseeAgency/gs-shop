import { NextRequest, NextResponse } from 'next/server'

// GET - Get user's donation history and impact
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ donations: [], total: 0 })
    }

    // Mock donations
    const donations: any[] = []
    const totalDonated = 0
    
    // Calculate impact
    const impact = {
      mealsProvided: Math.floor(totalDonated / 50), // 50 = 1 meal
      treesPlanted: Math.floor(totalDonated / 100), // 100 = 1 tree
      educationDays: Math.floor(totalDonated / 200), // 200 = 1 day education
      livesImpacted: donations.length > 0 ? Math.floor(totalDonated / 500) + 1 : 0
    }

    return NextResponse.json({
      donations,
      totalDonated,
      donationCount: donations.length,
      impact,
      taxBenefits: {
        eligible80G: totalDonated * 0.5, // 50% deduction under 80G
        section: '80G'
      },
      streak: calculateStreak(donations),
      badges: getDonationBadges(donations, totalDonated)
    })
  } catch (error) {
    console.error('Donation tracker error:', error)
    return NextResponse.json({ donations: [] })
  }
}

// POST - Record a new donation
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { causeId, amount, roundUpSource } = await req.json()

    // Mock donation creation
    const donation = {
      id: 'mock-' + Date.now(),
      userId,
      causeId,
      amount,
      roundUpSource: roundUpSource || null,
      createdAt: new Date()
    }

    return NextResponse.json({
      success: true,
      donation,
      message: `Thank you for donating ${amount}!`,
      impact: `Your donation will provide ${Math.floor(amount / 50)} meals`,
      receiptGenerated: true
    })
  } catch (error) {
    console.error('Donation error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function calculateStreak(donations: any[]) {
  if (donations.length === 0) return 0
  
  // Sort by date
  const sorted = donations.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  let streak = 1
  let currentDate = new Date(sorted[0].createdAt)
  
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i].createdAt)
    const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff <= 31) { // Within a month
      streak++
      currentDate = prevDate
    } else {
      break
    }
  }
  
  return streak
}

function getDonationBadges(donations: any[], total: number) {
  const badges = []
  
  if (donations.length >= 1) badges.push({ name: 'First Step', icon: '' })
  if (donations.length >= 5) badges.push({ name: 'Regular Donor', icon: '' })
  if (donations.length >= 10) badges.push({ name: 'Champion', icon: '' })
  if (total >= 1000) badges.push({ name: 'Big Heart', icon: '' })
  if (total >= 5000) badges.push({ name: 'Philanthropist', icon: '' })
  
  return badges
}
