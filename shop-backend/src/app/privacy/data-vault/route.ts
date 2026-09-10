import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get data vault status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ encrypted: false })
    }

    const settings = await prisma.privacySettings.findUnique({
      where: { userId }
    })

    // Get data summary
    const dataSummary = {
      searchQueries: await prisma.searchQuery.count({ where: { userId } }),
      productViews: await prisma.productView.count({ where: { userId } }),
      orders: await prisma.order.count({ where: { customerEmail: userId } }),
      wishlistItems: await prisma.wishlistItem.count({ where: { userId } })
    }

    return NextResponse.json({
      encrypted: settings?.dataVaultEnabled || false,
      localOnly: settings?.localDataOnly || false,
      dataSummary,
      sharingPreferences: {
        shareWithSellers: settings?.shareWithSellers !== false,
        shareForRecommendations: settings?.shareForRecommendations !== false,
        allowAnalytics: settings?.allowAnalytics !== false
      }
    })
  } catch (error) {
    console.error('Data vault error:', error)
    return NextResponse.json({ encrypted: false })
  }
}

// POST - Update data vault settings
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enableVault, sharingPreferences } = await req.json()

    await prisma.privacySettings.upsert({
      where: { userId },
      update: {
        dataVaultEnabled: enableVault,
        shareWithSellers: sharingPreferences?.shareWithSellers,
        shareForRecommendations: sharingPreferences?.shareForRecommendations,
        allowAnalytics: sharingPreferences?.allowAnalytics,
        updatedAt: new Date()
      },
      create: {
        userId,
        dataVaultEnabled: enableVault,
        shareWithSellers: sharingPreferences?.shareWithSellers ?? true,
        shareForRecommendations: sharingPreferences?.shareForRecommendations ?? true,
        allowAnalytics: sharingPreferences?.allowAnalytics ?? true
      }
    })

    return NextResponse.json({
      success: true,
      encrypted: enableVault,
      message: enableVault
        ? 'Data vault enabled. Your shopping data is now encrypted and stored securely.'
        : 'Data vault disabled. Standard storage resumed.'
    })
  } catch (error) {
    console.error('Data vault update error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
