import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'X-API-Key, Content-Type',
}

// GET - List pending seller applications (for main Grapsee admin)
export async function GET(request: NextRequest) {
  try {
    // Verify request using X-API-Key
    const apiKey = request.headers.get('x-api-key')
    const expectedApiKey = process.env.GRAPSEE_SHOP_API_KEY
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' }, 
        { status: 401, headers: corsHeaders }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Fetch pending sellers with full details
    const [sellers, total] = await Promise.all([
      prisma.seller.findMany({
        where: {
          onboardingStatus: 'pending_review',
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          onboarding: true,
          documents: true,
          settings: true,
        },
      }),
      prisma.seller.count({
        where: { onboardingStatus: 'pending_review' },
      }),
    ])

    // Format for Grapsee admin panel
    const formattedSellers = sellers.map(seller => {
      // Get business license doc
      const businessLicense = seller.documents.find(d => d.type === 'business_license')
      const taxCertificate = seller.documents.find(d => d.type === 'tax_certificate')
      const identityProof = seller.documents.find(d => d.type === 'identity')
      
      return {
        id: seller.id,
        businessName: seller.onboarding?.businessName || seller.name,
        email: seller.user?.email,
        phone: seller.onboarding?.phone,
        country: seller.onboarding?.country,
        status: seller.onboardingStatus,
        submittedAt: seller.onboarding?.submittedAt?.toISOString() || seller.createdAt.toISOString(),
        taxId: seller.onboarding?.taxId,
        bankAccount: seller.bankAccountNumber ? {
          accountNumber: `****${seller.bankAccountNumber.slice(-4)}`,
          bankName: seller.bankAccountName || 'Unknown',
          routingNumber: seller.bankRoutingNumber,
        } : null,
        documents: {
          businessLicense: businessLicense?.documentUrl || null,
          taxCertificate: taxCertificate?.documentUrl || null,
          identityProof: identityProof?.documentUrl || null,
        },
        policies: {
          returnPolicy: seller.settings?.returnPolicy || null,
          shippingPolicy: seller.settings?.shippingPolicy || null,
        },
        expectedCategories: [], // Note: specialties field doesn't exist in Seller schema
        estimatedMonthlyRevenue: seller.onboarding?.estimatedRevenue || null,
        notes: seller.onboarding?.notes || '',
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        sellers: formattedSellers,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching pending sellers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending sellers' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}
