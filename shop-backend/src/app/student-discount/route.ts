import { NextRequest, NextResponse } from 'next/server'

const PARTNER_UNIVERSITIES = [
  'MIT', 'Stanford University', 'Harvard University', 'Oxford University',
  'Cambridge University', 'UC Berkeley', 'Yale University', 'Princeton University',
  'Columbia University', 'University of Toronto', 'ETH Zurich', 'Tokyo University',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { universityEmail, studentId, university } = body

    if (!universityEmail || !studentId) {
      return NextResponse.json(
        { success: false, error: 'University email and student ID are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(universityEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check .edu or university domain
    const isEdu = universityEmail.endsWith('.edu') || universityEmail.endsWith('.ac.uk') || universityEmail.endsWith('.edu.cn')
    if (!isEdu) {
      return NextResponse.json({
        success: false,
        error: 'Please use a university email address (.edu, .ac.uk, .edu.cn)',
        hint: 'Your email should end with a university domain',
      }, { status: 400 })
    }

    // Generate discount code
    const discountCode = `STUDENT${Date.now().toString(36).toUpperCase()}`

    return NextResponse.json({
      success: true,
      verified: true,
      discountCode,
      discountPercent: 15,
      universityEmail,
      university: university || 'Verified University',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      eligibleCategories: ['Electronics', 'Books', 'Software', 'Fashion', 'Home', 'Sports'],
      terms: [
        '15% off on all eligible categories',
        'Valid for 1 year from verification',
        'Cannot be combined with other promotions',
        'One discount per order',
        'Student status must be re-verified annually',
      ],
      partnerUniversities: PARTNER_UNIVERSITIES,
    })
  } catch (error) {
    console.error('[STUDENT-DISCOUNT] Error:', error)
    return NextResponse.json({ success: false, error: 'Verification failed. Please try again.' }, { status: 500 })
  }
}
