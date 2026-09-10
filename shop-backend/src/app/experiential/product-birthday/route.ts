import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get product birthdays for user
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ birthdays: [] })
    }

    const now = new Date()

    // Get user's purchase history
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        status: { not: 'cancelled' }
      },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const birthdays = []

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product
        if (!product) continue

        const purchaseDate = new Date(order.createdAt)
        const monthsOwned = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        const yearsOwned = Math.floor(monthsOwned / 12)

        // Only include items owned for at least 1 month
        if (monthsOwned < 1) continue

        // Check for anniversaries (every year)
        const anniversaryDate = new Date(purchaseDate)
        anniversaryDate.setFullYear(now.getFullYear())
        const daysUntil = Math.ceil((anniversaryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Is it the anniversary (within 7 days)?
        if (daysUntil >= -7 && daysUntil <= 7) {
          birthdays.push({
            id: `${order.id}-${item.id}`,
            productId: product.id,
            productName: product.name,
            productImage: product.imageUrl,
            purchaseDate: order.createdAt,
            yearsOwned,
            monthsOwned: Math.floor(monthsOwned),
            anniversaryDate,
            daysUntil,
            isToday: daysUntil === 0,
            message: yearsOwned >= 1
              ? `Your ${product.name} is ${yearsOwned} year${yearsOwned > 1 ? 's' : ''} old today!`
              : `Your ${product.name} turns ${Math.floor(monthsOwned)} months!`,
            upgradeSuggestion: yearsOwned >= 2 ? await getUpgradeSuggestion(product) : null
          })
        }
      }
    }

    // Sort by days until (closest first)
    birthdays.sort((a, b) => Math.abs(a.daysUntil) - Math.abs(b.daysUntil))

    return NextResponse.json({
      birthdays,
      upcoming: birthdays.filter(b => b.daysUntil > 0),
      today: birthdays.filter(b => b.isToday),
      totalTracked: birthdays.length
    })
  } catch (error) {
    console.error('Product birthday error:', error)
    return NextResponse.json({ birthdays: [] })
  }
}

async function getUpgradeSuggestion(currentProduct: any) {
  const newer = await prisma.product.findFirst({
    where: {
      categoryId: currentProduct.categoryId,
      id: { not: currentProduct.id },
      createdAt: { gt: currentProduct.createdAt }
    },
    orderBy: { createdAt: 'desc' }
  })

  return newer ? {
    id: newer.id,
    name: newer.name,
    price: newer.price
  } : null
}
