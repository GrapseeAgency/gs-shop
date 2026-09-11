import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

// GET - Get seller settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
      include: {
        settings: true,
      },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    return NextResponse.json({
      store: {
        name: seller.name,
        slug: seller.slug,
        description: seller.description,
        logo: seller.logo,
        coverImage: seller.coverImage,
      },
      settings: seller.settings || {
        storeDescription: seller.description,
        defaultShippingDays: 3,
        emailOnNewOrder: true,
        emailOnLowStock: true,
        emailOnPayout: true,
        vacationMode: false,
        autoReplyEnabled: false,
      },
      commissionRate: seller.commissionRate,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT - Update seller settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      store,
      settings,
    } = body

    // Update seller profile
    if (store) {
      await prisma.seller.update({
        where: { id: seller.id },
        data: {
          name: store.name !== undefined ? store.name : undefined,
          description: store.description !== undefined ? store.description : undefined,
          logo: store.logo !== undefined ? store.logo : undefined,
          coverImage: store.coverImage !== undefined ? store.coverImage : undefined,
        },
      })
    }

    // Update or create settings
    if (settings) {
      await prisma.sellerSettings.upsert({
        where: { sellerId: seller.id },
        update: {
          storeDescription: settings.storeDescription !== undefined ? settings.storeDescription : undefined,
          returnPolicy: settings.returnPolicy !== undefined ? settings.returnPolicy : undefined,
          shippingPolicy: settings.shippingPolicy !== undefined ? settings.shippingPolicy : undefined,
          defaultShippingDays: settings.defaultShippingDays !== undefined ? settings.defaultShippingDays : undefined,
          freeShippingThreshold: settings.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : undefined
        },
        create: {
          sellerId: seller.id,
          storeDescription: settings.storeDescription,
          returnPolicy: settings.returnPolicy,
          shippingPolicy: settings.shippingPolicy,
          defaultShippingDays: settings.defaultShippingDays || 3,
          freeShippingThreshold: settings.freeShippingThreshold
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
