import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    // Fetch active products to build bundles from
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        bundles: [],
        message: 'No products available to create bundles',
      })
    }

    // Group products into bundles of 2-3 items
    const bundles = []
    const usedProductIds = new Set<string>()
    const bundleTemplates = [
      { name: 'Starter Kit', itemRange: [2, 3] as [number, number], discount: 0.10 },
      { name: 'Power Pack', itemRange: [2, 3] as [number, number], discount: 0.15 },
      { name: 'Pro Bundle', itemRange: [2, 2] as [number, number], discount: 0.12 },
      { name: 'Essential Combo', itemRange: [3, 3] as [number, number], discount: 0.18 },
      { name: 'Value Set', itemRange: [2, 2] as [number, number], discount: 0.08 },
      { name: 'Deluxe Collection', itemRange: [2, 3] as [number, number], discount: 0.20 },
    ]

    let idx = 0
    let bundleCount = 0

    while (idx < products.length && bundleCount < limit) {
      const template = bundleTemplates[bundleCount % bundleTemplates.length]
      const itemCount = Math.floor(
        Math.random() * (template.itemRange[1] - template.itemRange[0] + 1)
      ) + template.itemRange[0]

      // Pick products for this bundle
      const bundleProducts = []
      for (let j = 0; j < itemCount && idx < products.length; j++) {
        const product = products[idx]
        if (!usedProductIds.has(product.id)) {
          bundleProducts.push(product)
          usedProductIds.add(product.id)
        }
        idx++
      }

      if (bundleProducts.length < 2) continue

      // Calculate bundle pricing
      const originalTotal = bundleProducts.reduce(
        (sum, p) => sum + (p.comparePrice || p.price),
        0
      )
      const bundlePrice = Math.round(originalTotal * (1 - template.discount) * 100) / 100
      const savings = Math.round((originalTotal - bundlePrice) * 100) / 100
      const savingsPercent = Math.round(template.discount * 100)

      bundleCount++
      bundles.push({
        id: `bundle-${bundleCount}`,
        name: `${template.name} #${bundleCount}`,
        description: `Save ${savingsPercent}% with this curated bundle of ${bundleProducts.length} products`,
        products: bundleProducts.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          imageUrl: p.imageUrl,
          price: p.price,
          comparePrice: p.comparePrice || p.price,
          category: p.category,
          rating: p.rating,
          reviewCount: p.reviewCount,
          deliveryTime: p.deliveryTime,
        })),
        originalTotal: Math.round(originalTotal * 100) / 100,
        bundlePrice,
        savings,
        savingsPercent,
        badge: savingsPercent >= 15 ? ' Hot Deal' : ' Smart Buy',
        itemCount: bundleProducts.length,
        estimatedDelivery: '3-5 business days',
        isLimited: savingsPercent >= 18,
        stockLeft: Math.floor(Math.random() * 30) + 5,
      })
    }

    return NextResponse.json({
      success: true,
      bundles,
      total: bundles.length,
      meta: {
        title: ' Product Bundles',
        subtitle: 'Save more when you bundle up!',
        maxSavings: Math.max(...bundles.map((b) => b.savingsPercent)),
      },
    })
  } catch (error) {
    console.error('[BUNDLES] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product bundles' },
      { status: 500 }
    )
  }
}
