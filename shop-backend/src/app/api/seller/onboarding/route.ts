import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

// GET - Check onboarding status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find or create seller record
    let seller = await prisma.seller.findFirst({
      where: { userId: session.user.id }
    })

    if (!seller) {
      // Create new seller
      seller = await prisma.seller.create({
        data: {
          name: session.user.name || 'New Seller',
          slug: `seller-${String(session.user.id).slice(-8)}`,
          email: session.user.email || ''
        }
      })
    }

    return NextResponse.json({
      sellerId: seller.id,
      onboardingStatus: (seller as any).onboardingStatus || 'pending',
      progress: (seller as any).onboardingProgress || 0,
      completedSteps: [],
      isOnboarded: (seller as any).isOnboarded || false
    })
  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    )
  }
}

// POST - Update onboarding step
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { step, data } = body

    if (!step) {
      return NextResponse.json(
        { error: 'Step is required' },
        { status: 400 }
      )
    }

    // Find seller
    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
      include: { onboarding: true },
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    // Update based on step
    let updateData: any = {}
    
    switch (step) {
      case 'personal':
        updateData = {
          personalInfoCompleted: true,
          businessName: data.businessName,
          businessType: data.businessType,
          phone: data.phone,
          website: data.website,
        }
        break
      case 'business':
        updateData = {
          businessInfoCompleted: true,
          taxId: data.taxId,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country || 'BD',
        }
        break
      case 'documents':
        updateData = {
          documentsSubmitted: true,
        }
        // Create document records
        if (data.documents && Array.isArray(data.documents)) {
          for (const doc of data.documents) {
            await prisma.sellerDocument.create({
              data: {
                sellerId: seller.id,
                type: doc.type,
                documentUrl: doc.url,
              },
            })
          }
        }
        break
      case 'bank':
        // Update seller bank info
        await prisma.seller.update({
          where: { id: seller.id },
          data: {
            bankAccountName: data.accountName,
            bankAccountNumber: data.accountNumber,
            bankRoutingNumber: data.routingNumber,
            paypalEmail: data.paypalEmail,
            minPayoutAmount: data.minPayoutAmount || 50,
            autoPayoutEnabled: data.autoPayoutEnabled || false,
          },
        })
        updateData = {
          bankInfoCompleted: true,
        }
        break
      case 'store':
        // Update seller settings
        await prisma.sellerSettings.upsert({
          where: { sellerId: seller.id },
          update: {
            storeDescription: data.description,
            returnPolicy: data.returnPolicy,
            shippingPolicy: data.shippingPolicy,
            defaultShippingDays: data.shippingDays || 3,
            freeShippingThreshold: data.freeShippingThreshold,
          },
          create: {
            sellerId: seller.id,
            storeDescription: data.description,
            returnPolicy: data.returnPolicy,
            shippingPolicy: data.shippingPolicy,
            defaultShippingDays: data.shippingDays || 3,
            freeShippingThreshold: data.freeShippingThreshold,
          },
        })
        updateData = {
          storeSetupCompleted: true,
        }
        break
      case 'submit':
        updateData = {
          submittedAt: new Date(),
        }
        // Update seller status
        await prisma.seller.update({
          where: { id: seller.id },
          data: {
            onboardingStatus: 'pending_review',
          },
        })
        
        // Trigger webhook to notify Grapsee admin
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/webhooks/seller-application`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sellerId: seller.id,
              event: 'submitted',
            }),
          })
        } catch (error) {
          console.error('Failed to trigger webhook:', error)
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid step' },
          { status: 400 }
        )
    }

    // Update onboarding record
    if (Object.keys(updateData).length > 0 && seller.onboarding) {
      await prisma.sellerOnboarding.update({
        where: { id: seller.onboarding.id },
        data: updateData,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Step '${step}' completed successfully`,
    })
  } catch (error) {
    console.error('Error updating onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to update onboarding' },
      { status: 500 }
    )
  }
}
