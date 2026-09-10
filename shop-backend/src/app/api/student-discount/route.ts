import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// International university email domains
const INTERNATIONAL_EDU_DOMAINS = [
  // United States
  '.edu',
  // United Kingdom
  '.ac.uk', '.sch.uk', '.gov.uk',
  // Australia
  '.edu.au', '.ac.au',
  // New Zealand
  '.ac.nz', '.school.nz',
  // Canada
  '.ca', // Many Canadian universities use .ca
  // Japan
  '.ac.jp', '.edu.jp',
  // India
  '.ac.in', '.edu.in', '.res.in',
  // Germany
  '.uni-', '.tu-', '.fu-', '.hu-', '.uni.',
  // France
  '.univ-', '.universite.', '.edu.fr',
  // Netherlands
  '.uni.', '.nl', // Dutch universities
  // Sweden
  '.uni.se', '.se', // Swedish universities
  // Denmark
  '.uni.dk', '.dk',
  // Norway
  '.uni.no', '.no',
  // Finland
  '.uni.fi', '.fi',
  // Singapore
  '.edu.sg',
  // Hong Kong
  '.edu.hk', '.hk',
  // South Korea
  '.ac.kr', '.edu.kr',
  // China
  '.edu.cn', '.ac.cn',
  // Brazil
  '.edu.br',
  // Mexico
  '.edu.mx', '.unam.mx',
  // South Africa
  '.ac.za', '.edu.za',
  // UAE
  '.ac.ae', '.edu.ae',
  // Saudi Arabia
  '.edu.sa',
  // Malaysia
  '.edu.my', '.my',
  // Thailand
  '.ac.th',
  // Philippines
  '.edu.ph',
  // Indonesia
  '.ac.id', '.edu.id',
  // Taiwan
  '.edu.tw',
  // Turkey
  '.edu.tr',
  // Russia
  '.edu.ru', '.ac.ru',
  // Israel
  '.ac.il', '.edu.il',
  // Argentina
  '.edu.ar',
  // Chile
  '.cl', // Chilean universities
  // Colombia
  '.edu.co',
  // Generic academic patterns
  'uni.', 'university.', 'college.', 'institute.', 'academy.',
  'student.', 'campus.', 'alumni.'
]

const PARTNER_UNIVERSITIES = [
  'MIT', 'Stanford University', 'Harvard University', 'Oxford University',
  'Cambridge University', 'UC Berkeley', 'Yale University', 'Princeton University',
  'Columbia University', 'University of Toronto', 'ETH Zurich', 'Tokyo University',
  'National University of Singapore', 'University of Melbourne', 'Tsinghua University',
  'Peking University', 'University of Hong Kong', 'Seoul National University',
  'Indian Institute of Technology', 'University of Sydney', 'Imperial College London',
  'University of Edinburgh', 'Technical University of Munich', 'Delft University of Technology',
  'KU Leuven', 'University of Copenhagen', 'Karolinska Institute'
]

function isUniversityEmail(email: string): { valid: boolean; detectedDomain?: string } {
  const lowerEmail = email.toLowerCase()
  
  for (const domain of INTERNATIONAL_EDU_DOMAINS) {
    if (lowerEmail.endsWith(domain)) {
      return { valid: true, detectedDomain: domain }
    }
    if (lowerEmail.includes(domain)) {
      return { valid: true, detectedDomain: domain }
    }
  }
  
  // Check for common patterns
  const uniPatterns = /\.(edu|ac\.\w{2}|uni[\-\.]|university[\-\.])/
  if (uniPatterns.test(lowerEmail)) {
    return { valid: true, detectedDomain: 'pattern-match' }
  }
  
  return { valid: false }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    
    if (!userId) {
      return NextResponse.json({
        supportedDomains: INTERNATIONAL_EDU_DOMAINS,
        partnerUniversities: PARTNER_UNIVERSITIES,
        isVerified: false
      })
    }
    
    // Check if user already has verified student status
    const verification = await prisma.studentVerification.findUnique({
      where: { userId }
    })
    
    return NextResponse.json({
      supportedDomains: INTERNATIONAL_EDU_DOMAINS,
      partnerUniversities: PARTNER_UNIVERSITIES,
      isVerified: verification?.status === 'verified',
      verification: verification?.status === 'verified' ? {
        method: verification.verificationMethod,
        universityName: verification.universityName,
        verifiedAt: verification.verifiedAt,
        expiresAt: verification.expiresAt,
        discountCode: verification.discountCode,
        discountPercent: verification.discountPercent
      } : null
    })
  } catch (error) {
    console.error('[STUDENT-DISCOUNT-GET]', error)
    return NextResponse.json({ error: 'Failed to fetch verification status' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required for student verification' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { 
      universityEmail, 
      studentId, 
      university,
      verificationMethod = 'email',
      idDocumentUrl // For ID upload method
    } = body

    // Check if already verified
    const existingVerification = await prisma.studentVerification.findUnique({
      where: { userId }
    })

    if (existingVerification?.status === 'verified') {
      // Check if still valid
      if (existingVerification.expiresAt && new Date(existingVerification.expiresAt) > new Date()) {
        return NextResponse.json({
          success: true,
          verified: true,
          alreadyVerified: true,
          discountCode: existingVerification.discountCode,
          discountPercent: existingVerification.discountPercent,
          expiresAt: existingVerification.expiresAt,
          message: 'You already have an active student discount!'
        })
      }
    }

    if (verificationMethod === 'email') {
      // Email domain verification
      if (!universityEmail || !studentId) {
        return NextResponse.json(
          { success: false, error: 'University email and student ID are required' },
          { status: 400 }
        )
      }

      const emailValidation = isUniversityEmail(universityEmail)
      
      if (!emailValidation.valid) {
        return NextResponse.json({
          success: false,
          error: 'Please use a valid university email address',
          hint: 'Supported domains include .edu, .ac.uk, .edu.au, .ac.jp, .ac.in, and many more international academic domains',
          supportedDomains: INTERNATIONAL_EDU_DOMAINS.slice(0, 10),
          totalSupported: INTERNATIONAL_EDU_DOMAINS.length
        }, { status: 400 })
      }

      // Generate discount code
      const discountCode = `STUDENT${Date.now().toString(36).toUpperCase().slice(0, 8)}`
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year

      // Create or update verification record
      const verification = await prisma.studentVerification.upsert({
        where: { userId },
        create: {
          userId,
          verificationMethod: 'email_domain',
          universityEmail: universityEmail.toLowerCase().trim(),
          universityName: university || 'Verified University',
          studentIdNumber: studentId,
          status: 'verified',
          verifiedAt: new Date(),
          expiresAt,
          discountCode,
          discountPercent: 15
        },
        update: {
          verificationMethod: 'email_domain',
          universityEmail: universityEmail.toLowerCase().trim(),
          universityName: university || 'Verified University',
          studentIdNumber: studentId,
          status: 'verified',
          verifiedAt: new Date(),
          expiresAt,
          discountCode,
          discountPercent: 15,
          idDocumentUrl: null,
          idDocumentVerified: false
        }
      })

      return NextResponse.json({
        success: true,
        verified: true,
        discountCode: verification.discountCode,
        discountPercent: verification.discountPercent,
        universityEmail: verification.universityEmail,
        university: verification.universityName,
        expiresAt: verification.expiresAt?.toISOString(),
        eligibleCategories: ['Digital Products', 'E-Books', 'Templates', 'Software', 'Courses', 'Plugins'],
        terms: [
          '15% off on all eligible categories',
          'Valid for 1 year from verification',
          'Cannot be combined with other promotions',
          'One discount per order',
          'Student status must be re-verified annually',
          'International students from 50+ countries supported'
        ],
        partnerUniversities: PARTNER_UNIVERSITIES,
        verificationMethod: 'email_domain'
      })

    } else if (verificationMethod === 'id_upload') {
      // ID document verification (manual review)
      if (!idDocumentUrl) {
        return NextResponse.json(
          { success: false, error: 'Student ID document is required for manual verification' },
          { status: 400 }
        )
      }

      // Create pending verification record
      const verification = await prisma.studentVerification.upsert({
        where: { userId },
        create: {
          userId,
          verificationMethod: 'id_upload',
          universityEmail: universityEmail?.toLowerCase().trim() || null,
          universityName: university || null,
          studentIdNumber: studentId || null,
          idDocumentUrl,
          idDocumentVerified: false,
          status: 'pending',
          discountCode: null,
          discountPercent: 15
        },
        update: {
          verificationMethod: 'id_upload',
          universityEmail: universityEmail?.toLowerCase().trim() || null,
          universityName: university || null,
          studentIdNumber: studentId || null,
          idDocumentUrl,
          idDocumentVerified: false,
          status: 'pending',
          discountCode: null
        }
      })

      return NextResponse.json({
        success: true,
        verified: false,
        pending: true,
        message: 'Your student ID has been submitted for review. You will receive an email within 24-48 hours with your discount code.',
        verificationId: verification.id,
        status: 'pending',
        verificationMethod: 'id_upload'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid verification method' },
      { status: 400 }
    )

  } catch (error) {
    console.error('[STUDENT-DISCOUNT-POST]', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
