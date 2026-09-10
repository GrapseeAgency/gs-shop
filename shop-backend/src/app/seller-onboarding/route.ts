import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const onboardingSteps = [
  { step: 1, title: 'Personal Information', fields: ['name', 'email', 'phone'] },
  { step: 2, title: 'Business Details', fields: ['businessName', 'businessType', 'registrationNumber'] },
  { step: 3, title: 'Document Upload', fields: ['businessLicense', 'taxCertificate', 'bankStatement'] },
  { step: 4, title: 'Store Setup', fields: ['storeName', 'storeDescription', 'storeCategory'] },
  { step: 5, title: 'Review & Submit', fields: ['termsAgreement', 'policyAgreement'] },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (email) where.email = email
    if (status) where.status = status

    let onboardings = await prisma.sellerOnboarding.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })

    if (onboardings.length === 0 && !email) {
      onboardings = [] as any
    }

    const result = onboardings.map((o: any) => ({
      ...o,
      documents: o.documents ? (typeof o.documents === 'string' ? JSON.parse(o.documents) : o.documents) : [],
      progress: {
        currentStep: o.step,
        totalSteps: onboardingSteps.length,
        percentComplete: Math.round((o.step / onboardingSteps.length) * 100),
        steps: onboardingSteps.map((s) => ({
          ...s,
          completed: s.step <= o.step,
          current: s.step === o.step,
        })),
      },
      statusLabel: o.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }))

    return NextResponse.json({ onboardings: result, total: result.length, steps: onboardingSteps })
  } catch (error) {
    console.error('Seller onboarding list error:', error)
    return NextResponse.json(
      {
        onboardings: [].map(o => ({
          ...o,
          documents: JSON.parse(o.documents || '[]'),
          progress: {
            currentStep: o.step,
            totalSteps: 5,
            percentComplete: Math.round((o.step / 5) * 100),
            steps: onboardingSteps.map(s => ({ ...s, completed: s.step <= o.step, current: s.step === o.step })),
          },
          statusLabel: o.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        })),
        total: [].length,
        steps: onboardingSteps,
      },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, businessName, step, documents } = body

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Check if email already has an onboarding
    const existing = await prisma.sellerOnboarding.findFirst({ where: { email } })

    if (existing) {
      // Update existing onboarding
      const updateData: any = {
        name,
        phone,
        step: step || existing.step,
        updatedAt: new Date(),
      }
      if (businessName) updateData.businessName = businessName
      if (documents) updateData.documents = JSON.stringify(documents)

      // Auto-advance status based on step
      if (step === 5 && existing.status === 'draft') {
        updateData.status = 'submitted'
      }

      const updated = await prisma.sellerOnboarding.update({
        where: { id: existing.id },
        data: updateData,
      })

      return NextResponse.json({
        success: true,
        onboarding: {
          ...updated,
          documents: updated.documents ? JSON.parse(updated.documents) : [],
          progress: {
            currentStep: updated.step,
            totalSteps: onboardingSteps.length,
            percentComplete: Math.round((updated.step / onboardingSteps.length) * 100),
          },
          message: updated.status === 'submitted'
            ? 'Application submitted successfully! We\'ll review it within 2-3 business days.'
            : 'Progress saved successfully.',
        },
      })
    }

    // Create new onboarding
    const onboarding = await prisma.sellerOnboarding.create({
      data: {
        seller: {
          connectOrCreate: {
            where: { email: email || '' },
            create: {
              email: email || '',
              name: name || '',
              slug: (name || 'seller').toLowerCase().replace(/\s+/g, '-')
            }
          }
        }
      },
    })

    return NextResponse.json({
      success: true,
      onboarding: {
        ...onboarding,
        documents: onboarding.documents ? JSON.parse(onboarding.documents) : [],
        progress: {
          currentStep: onboarding.step,
          totalSteps: onboardingSteps.length,
          percentComplete: Math.round((onboarding.step / onboardingSteps.length) * 100),
        },
        message: 'Seller onboarding started. Complete all 5 steps to submit your application.',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Seller onboarding create error:', error)
    return NextResponse.json(
      { error: 'Failed to process seller onboarding' },
      { status: 500 }
    )
  }
}
