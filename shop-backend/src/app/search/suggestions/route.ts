import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const COMMON_SUGGESTIONS = [
  'website development',
  'mobile app',
  'UI/UX design',
  'DevOps',
  'cloud hosting',
  'e-commerce',
  'SEO optimization',
  'API development',
  'React',
  'Node.js',
  'Python',
  'Flutter',
  'AWS',
  'Docker',
  'Kubernetes'
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''

    if (!query || query.length < 2) {
      return NextResponse.json({ 
        suggestions: COMMON_SUGGESTIONS.slice(0, 8),
        trending: COMMON_SUGGESTIONS.slice(0, 5)
      })
    }

    // Search products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { tags: { contains: query } }
        ]
      },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true
      }
    })

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        name: { contains: query }
      },
      take: 3,
      select: {
        name: true,
        slug: true
      }
    })

    // Get suggestions from search history
    const searchHistory = await prisma.searchSuggestion.findMany({
      where: {
        query: { startsWith: query }
      },
      orderBy: { hitCount: 'desc' },
      take: 5
    })

    // Combine suggestions
    const suggestions = [
      // Product matches
      ...products.map(p => ({
        type: 'product',
        text: p.name,
        slug: p.slug,
        id: p.id
      })),
      // Category matches
      ...categories.map(c => ({
        type: 'category',
        text: c.name,
        slug: c.slug
      })),
      // Search history
      ...searchHistory.map(h => ({
        type: 'suggestion',
        text: h.query,
        suggestions: JSON.parse(h.suggestions || '[]')
      })),
      // Common completions
      ...COMMON_SUGGESTIONS
        .filter(s => s.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map(s => ({
          type: 'trending',
          text: s
        }))
    ]

    // Remove duplicates
    const unique = suggestions.filter((s, i, arr) => 
      arr.findIndex(t => t.text === s.text) === i
    )

    return NextResponse.json({
      query,
      suggestions: unique.slice(0, 10),
      totalResults: products.length
    })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json({ 
      suggestions: COMMON_SUGGESTIONS.slice(0, 8)
    })
  }
}

// POST - Save search query
export async function POST(req: NextRequest) {
  try {
    const { query, results } = await req.json()

    if (!query || query.length < 3) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 })
    }

    // Update or create search suggestion
    await prisma.searchSuggestion.upsert({
      where: { query: query.toLowerCase() },
      update: {
        hitCount: { increment: 1 },
        lastUsedAt: new Date(),
        suggestions: JSON.stringify(results || [])
      },
      create: {
        query: query.toLowerCase(),
        suggestions: JSON.stringify(results || []),
        hitCount: 1
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Search save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
