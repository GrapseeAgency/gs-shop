import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const onboardingSteps = [
  { step: 1, title: 'Personal Information', fields: ['name', 'email', 'phone'] },
  { step: 2, title: 'Business Details', fields: ['businessName', 'businessType', 'registrationNumber'] },
  { step: 3, title: 'Document Upload', fields: ['businessLicense', 'taxCertificate', 'bankStatement'] },
  { step: 4, title: 'Store Setup', fields: ['storeName', 'storeDescription', 'storeCategory'] },
  { step: 5, title: 'Review & Submit', fields: ['termsAgreement', 'policyAgreement'] },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId') || session?.user?.id
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    const where: any = {}
    if (status) where.notes = { contains: status } // Use notes field for status since status doesn't exist
    if (userId) where.sellerId = userId // Use sellerId instead of userId

    const [onboardings, total] = await Promise.all([
      prisma.sellerOnboarding.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.sellerOnboarding.count({ where
      })
    ])

    const result = onboardings.map((o) => ({
      id: o.id,
      sellerId: o.sellerId,
      businessName: o.businessName,
      businessType: o.businessType,
      taxId: o.taxId,
      phone: o.phone,
      website: o.website,
      address: o.address,
      city: o.city,
      state: o.state,
      zipCode: o.zipCode,
      country: o.country,
      step: o.step || 0,
      status: o.status || 'pending',
      documents: [],
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      userId: o.sellerId, // Use sellerId as userId
      progress: {
        currentStep: 1,
        totalSteps: onboardingSteps.length,
        percentComplete: Math.round((1 / onboardingSteps.length) * 100),
        steps: onboardingSteps.map((s) => ({
          ...s,
          completed: s.step <= 1,
          current: s.step === 1,
        })),
      },
      statusLabel: 'Draft',
    }))

    return NextResponse.json({
      success: true,
      data: {
        onboardings: result,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total
        },
        steps: onboardingSteps,
        summary: {
          totalApplications: total,
          draftCount: onboardings.length, // All are draft since status doesn't exist
          submittedCount: 0,
          underReviewCount: 0,
          approvedCount: 0,
          rejectedCount: 0,
        }
      }
    })
  } catch (error) {
    console.error('Seller onboarding list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seller onboarding applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      businessName, 
      businessType, 
      taxId,
      phone, 
      website,
      address,
      city,
      state,
      zipCode,
      country
    } = body

    if (!businessName) {
      return NextResponse.json(
        { success: false, error: 'Business name is required' },
        { status: 400 }
      )
    }

    // Check if user already has a seller account
    const existingSeller = await prisma.seller.findFirst({ 
      where: { userId: session.user.id } 
    })

    if (!existingSeller) {
      return NextResponse.json({ success: false, error: 'Seller account not found' }, { status: 404 })
    }

    // Check if seller already has an onboarding
    const existing = await prisma.sellerOnboarding.findFirst({ 
      where: { sellerId: existingSeller.id } 
    })

    if (existing) {
      // Check if user owns this onboarding
      if (existing.sellerId !== session.user.id) {
        return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
      }

      // Update existing onboarding
      const updateData: any = {
        updatedAt: new Date(),
      }
      
      // Update optional fields if provided
      if (businessName !== undefined) updateData.businessName = businessName
      if (businessType !== undefined) updateData.businessType = businessType
      if (taxId !== undefined) updateData.taxId = taxId
      if (phone !== undefined) updateData.phone = phone
      if (website !== undefined) updateData.website = website
      if (address !== undefined) updateData.address = address
      if (city !== undefined) updateData.city = city
      if (state !== undefined) updateData.state = state
      if (zipCode !== undefined) updateData.zipCode = zipCode
      if (country !== undefined) updateData.country = country

      // Note: step, status, documents, submittedAt don't exist in schema

      const updated = await prisma.sellerOnboarding.update({
        where: { id: existing.id },
        data: updateData,
      })

      return NextResponse.json({
        success: true,
        data: {
          ...updated,
          documents: [], // Default empty array
          progress: {
            currentStep: 1,
            totalSteps: onboardingSteps.length,
            percentComplete: Math.round((1 / onboardingSteps.length) * 100),
            steps: onboardingSteps.map((s) => ({
              ...s,
              completed: s.step <= 1,
              current: s.step === 1,
            })),
          },
          statusLabel: 'Draft',
          message: 'Progress saved successfully.',
        },
      })
    }

    // Create new onboarding
    const onboarding = await prisma.sellerOnboarding.create({
      data: {
        sellerId: existingSeller.id,
        businessName: businessName || '',
        businessType: businessType || '',
        taxId: taxId || '',
        phone: phone || '',
        website: website || '',
        address: address || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
        country: country || 'BD',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...onboarding,
        documents: [], // Default empty array
        progress: {
          currentStep: 1,
          totalSteps: onboardingSteps.length,
          percentComplete: Math.round((1 / onboardingSteps.length) * 100),
          steps: onboardingSteps.map((s) => ({
            ...s,
            completed: s.step <= 1,
            current: s.step === 1,
          })),
        },
        statusLabel: 'Draft',
        message: 'Seller onboarding started. Complete all 5 steps to submit your application.',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Seller onboarding create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process seller onboarding' },
      { status: 500 }
    )
  }
}

// PUT /api/seller-onboarding Update onboarding status (admin)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { onboardingId, status, reviewNotes } = body

    if (!onboardingId || !status) {
      return NextResponse.json({ success: false, error: 'Onboarding ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 })
    }

    const existingOnboarding = await prisma.sellerOnboarding.findUnique({
      where: { id: onboardingId }
    })

    if (!existingOnboarding) {
      return NextResponse.json({ success: false, error: 'Onboarding not found' }, { status: 404 })
    }

    const updateData: any = { notes: status } // Use notes field since status doesn't exist
    if (reviewNotes !== undefined) updateData.notes = reviewNotes
    
    if (status === 'approved') {
      // Note: approvedAt doesn't exist in schema
      // Create seller account
      await prisma.seller.create({
        data: {
          name: existingOnboarding.businessName || 'Seller',
          email: existingOnboarding.businessName ? `${existingOnboarding.businessName.toLowerCase().replace(/\s+/g, '-')}@grapsee.com` : 'seller@grapsee.com',
          slug: existingOnboarding.businessName?.toLowerCase().replace(/\s+/g, '-') || 'seller'
        }
      })
    }

    const updated = await prisma.sellerOnboarding.update({
      where: { id: onboardingId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        documents: [], // Default empty array since documents doesn't exist
        statusLabel: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        message: `Onboarding ${status} successfully${status === 'approved' ? '. Seller account created!' : '.'}`,
      },
    })
  } catch (error) {
    console.error('Seller onboarding update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update seller onboarding' }, { status: 500 })
  }
}
