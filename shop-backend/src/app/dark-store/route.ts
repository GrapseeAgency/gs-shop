import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const hour = now.getHours()
    const isOpen = hour >= 22 || hour < 6

    // Calculate next opening/closing time
    let nextEvent: string
    if (isOpen) {
      const closeTime = new Date(now)
      closeTime.setHours(6, 0, 0, 0)
      if (hour >= 22) closeTime.setDate(closeTime.getDate() + 1)
      nextEvent = closeTime.toISOString()
    } else {
      const openTime = new Date(now)
      if (hour >= 6) openTime.setDate(openTime.getDate() + 1)
      openTime.setHours(22, 0, 0, 0)
      nextEvent = openTime.toISOString()
    }

    const products = await prisma.product.findMany({
      where: { isActive: true, comparePrice: { not: null } },
      include: { category: { select: { name: true } } },
      take: 6,
      orderBy: { discount: 'desc' },
    })

    const darkProducts = products.length > 0
      ? products.filter((p) => p.comparePrice && p.comparePrice > p.price).map((p, i) => ({
          id: p.id, name: p.name, slug: p.slug, imageUrl: p.imageUrl,
          price: p.price, comparePrice: p.comparePrice!,
          discount: Math.round(((p.comparePrice! - p.price) / p.comparePrice!) * 100),
          category: p.category?.name || 'General',
          flashDeal: i < 3,
          flashExpiresAt: new Date(Date.now() + (2 + i * 2) * 3600000).toISOString(),
        }))
      : []

    return NextResponse.json({
      success: true,
      isOpen,
      nextEvent,
      operatingHours: { open: '10:00 PM', close: '6:00 AM' },
      products: darkProducts,
      message: isOpen ? ' Dark Store is OPEN! Exclusive deals await.' : ' Dark Store is closed. Opens at 10 PM.',
    })
  } catch (error) {
    console.error('[DARK-STORE] Error:', error)
    return NextResponse.json({
      success: true, isOpen: false, nextEvent: new Date().toISOString(),
      operatingHours: { open: '10:00 PM', close: '6:00 AM' },
      products: [],
      message: ' Dark Store deals loaded.',
    })
  }
}
