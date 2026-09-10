import { NextRequest, NextResponse } from 'next/server'

// In-memory age verification store
const verifications = new Map<string, {
  status: 'pending' | 'verified' | 'rejected'
  method: string
  dateOfBirth: string
  verifiedAt?: string
  rejectedReason?: string
}>()

// GET /api/verify-age?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'guest'

    const verification = verifications.get(userId)

    return NextResponse.json({
      userId,
      status: verification?.status || 'pending',
      method: verification?.method || null,
      dateOfBirth: verification?.dateOfBirth || null,
      verifiedAt: verification?.verifiedAt || null,
      rejectedReason: verification?.rejectedReason || null,
    })
  } catch (error) {
    console.error('Error fetching age verification:', error)
    return NextResponse.json({ error: 'Failed to fetch verification' }, { status: 500 })
  }
}

// POST /api/verify-age
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = 'guest', dateOfBirth, method } = body

    if (!dateOfBirth || !method) {
      return NextResponse.json({ error: 'Date of birth and method are required' }, { status: 400 })
    }

    // Calculate age from date of birth
    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }

    const isEligible = age >= 18
    const status: 'verified' | 'rejected' = isEligible ? 'verified' : 'rejected'

    const verification = {
      status,
      method,
      dateOfBirth,
      ...(isEligible ? { verifiedAt: new Date().toISOString() } : {}),
      ...(!isEligible ? { rejectedReason: 'You must be at least 18 years old' } : {}),
    }

    verifications.set(userId, verification)

    return NextResponse.json({
      userId,
      ...verification,
      age,
    })
  } catch (error) {
    console.error('Error verifying age:', error)
    return NextResponse.json({ error: 'Failed to verify age' }, { status: 500 })
  }
}
