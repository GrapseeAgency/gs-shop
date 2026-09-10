import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get notification preferences
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    })

    if (!preferences) {
      // Create default preferences
      const defaults = await prisma.notificationPreference.create({
        data: {
          userId,
          priceDrops: true,
          backInStock: true,
          newArrivals: true,
          orderMilestones: true,
          dealExpiry: true,
          reviewReminders: true,
          birthdayOffers: true,
          lowStock: true,
          channels: 'email,push'
        }
      })
      return NextResponse.json({ preferences: defaults })
    }

    return NextResponse.json({
      preferences: {
        priceDrops: preferences.priceDrops,
        backInStock: preferences.backInStock,
        newArrivals: preferences.newArrivals,
        orderMilestones: preferences.orderMilestones,
        dealExpiry: preferences.dealExpiry,
        reviewReminders: preferences.reviewReminders,
        birthdayOffers: preferences.birthdayOffers,
        lowStock: preferences.lowStock
      },
      channels: {
        email: preferences.channels.includes('email'),
        push: preferences.channels.includes('push'),
        sms: preferences.channels.includes('sms')
      }
    })
  } catch (error) {
    console.error('Notification preferences error:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

// PUT - Update preferences
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { preferences, channels } = await req.json()

    const updateData: any = {}

    if (preferences) {
      Object.assign(updateData, preferences)
    }

    if (channels) {
      const channelList = []
      if (channels.email) channelList.push('email')
      if (channels.push) channelList.push('push')
      if (channels.sms) channelList.push('sms')
      updateData.channels = channelList.join(',')
    }

    const updated = await prisma.notificationPreference.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...preferences,
        channels: channels ? Object.entries(channels).filter(([_, v]) => v).map(([k]) => k).join(',') : 'email,push'
      }
    })

    return NextResponse.json({ success: true, preferences: updated })
  } catch (error) {
    console.error('Notification preferences update error:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
