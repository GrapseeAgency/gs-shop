import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

function getCurrentSeason(): { season: string; month: string; emoji: string } {
  const now = new Date()
  const month = now.getMonth() // 0-11

  // Northern hemisphere seasons
  if (month >= 2 && month <= 4) {
    return { season: 'spring', month: now.toLocaleString('en-US', { month: 'long' }), emoji: '' }
  } else if (month >= 5 && month <= 7) {
    return { season: 'summer', month: now.toLocaleString('en-US', { month: 'long' }), emoji: '' }
  } else if (month >= 8 && month <= 10) {
    return { season: 'autumn', month: now.toLocaleString('en-US', { month: 'long' }), emoji: '' }
  } else {
    return { season: 'winter', month: now.toLocaleString('en-US', { month: 'long' }), emoji: '' }
  }
}

const seasonConfig: Record<string, {
  emoji: string
  banner: { title: string; subtitle: string; gradient: string; cta: string }
  tags: string[]
  themes: string[]
}> = {
  spring: {
    emoji: '',
    banner: {
      title: 'Spring Collection',
      subtitle: 'Fresh starts, fresh designs  bloom with new possibilities',
      gradient: 'from-green-400 to-emerald-500',
      cta: 'Shop Spring Picks',
    },
    tags: ['fresh-start', 'spring-cleaning', 'renewal', 'growth', 'new-launch'],
    themes: ['Productivity Tools', 'Website Redesigns', 'Brand Refresh'],
  },
  summer: {
    emoji: '',
    banner: {
      title: 'Summer Essentials',
      subtitle: 'Hot deals for hot projects  build something amazing this summer',
      gradient: 'from-yellow-400 via-orange-400 to-red-400',
      cta: 'Explore Summer Deals',
    },
    tags: ['summer-sale', 'hot-deal', 'vacation', 'outdoor', 'travel'],
    themes: ['Mobile Apps', 'Travel & Food', 'Social Platforms'],
  },
  autumn: {
    emoji: '',
    banner: {
      title: 'Autumn Harvest',
      subtitle: 'Reap the rewards  premium tools at harvest-season prices',
      gradient: 'from-orange-400 via-amber-500 to-yellow-600',
      cta: 'Browse Autumn Picks',
    },
    tags: ['back-to-school', 'harvest', 'cozy', 'preparation', 'upgrade'],
    themes: ['Education & LMS', 'Business Tools', 'Analytics Dashboards'],
  },
  winter: {
    emoji: '',
    banner: {
      title: 'Winter Warmers',
      subtitle: 'Cozy up with hot deals  our biggest discounts of the year',
      gradient: 'from-blue-400 via-indigo-400 to-purple-500',
      cta: 'Discover Winter Deals',
    },
    tags: ['holiday', 'year-end', 'gift', 'winter-sale', 'new-year'],
    themes: ['E-commerce', 'Corporate Solutions', 'Enterprise Tools'],
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seasonOverride = searchParams.get('season') as string | null
    const limit = parseInt(searchParams.get('limit') || '8')

    const current = seasonOverride && seasonConfig[seasonOverride]
      ? { season: seasonOverride, month: 'Custom', emoji: seasonConfig[seasonOverride].emoji }
      : getCurrentSeason()

    const config = seasonConfig[current.season]

    // Fetch products matching seasonal tags
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      take: 30,
    })

    // Filter products that match seasonal themes via tags or category
    const seasonalProducts = allProducts.filter((product) => {
      try {
        const tags: string[] = product.tags ? JSON.parse(product.tags) : []
        const hasMatchingTag = tags.some((tag) =>
          config.tags.some((seasonTag) =>
            tag.toLowerCase().includes(seasonTag.toLowerCase())
          )
        )
        const hasDiscount = product.discount >= 10
        const isTrending = product.isTrending
        const isNew = product.isNew
        return hasMatchingTag || (hasDiscount && isTrending) || isNew
      } catch {
        return product.discount >= 10 || product.isNew
      }
    })

    // Limit results and add seasonal metadata
    const limitedProducts = seasonalProducts.slice(0, limit).map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      comparePrice: product.comparePrice || product.price,
      discount: product.discount,
      imageUrl: product.imageUrl,
      rating: product.rating,
      reviewCount: product.reviewCount,
            deliveryTime: product.deliveryTime,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      seasonalTag: product.discount >= 20 ? ' Hot Deal' : product.isNew ? ' New' : ' Seasonal Pick',
    }))

    // Fetch seasonal collections
    const collections = await prisma.collection.findMany({
      where: {
        type: 'seasonal',
      },
            take: 4,
    })

    const seasonalCollections = collections.map((col) => ({
      id: col.id,
      title: col.title,
      description: col.description,
      imageUrl: col.imageUrl,
      type: col.type,
      isFeatured: col.isFeatured,
    }))

    // Curated suggestions based on season themes
    const suggestions = config.themes.map((theme, idx) => ({
      id: `suggestion-${idx + 1}`,
      title: theme,
      description: `Explore ${current.season}-ready ${theme.toLowerCase()} for your next project`,
      icon: ['', '', '', ''][idx] || '',
    }))

    return NextResponse.json({
      success: true,
      season: {
        current: current.season,
        month: current.month,
        emoji: current.emoji,
        banner: config.banner,
      },
      products: limitedProducts,
      collections: seasonalCollections,
      suggestions,
      totalProducts: seasonalProducts.length,
      meta: {
        title: `${current.emoji} ${config.banner.title}`,
        subtitle: config.banner.subtitle,
        autoDetected: !seasonOverride,
        availableSeasons: Object.keys(seasonConfig).map((s) => ({
          key: s,
          emoji: seasonConfig[s].emoji,
          name: s.charAt(0).toUpperCase() + s.slice(1),
        })),
      },
    })
  } catch (error) {
    console.error('[SEASONAL] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seasonal products' },
      { status: 500 }
    )
  }
}
