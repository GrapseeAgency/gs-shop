import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/trending-searches
 * Returns trending search terms from real user searches in the last 24 hours
 * If no searches exist, returns empty array (silent)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
    
    // Get trending searches from last 24h using SearchSuggestion model
    // Group by query and count occurrences
    const trendingSearches = await prisma.searchSuggestion.findMany({
      where: {
        lastUsedAt: {
          gte: twentyFourHoursAgo
        }
      },
      orderBy: {
        hitCount: 'desc'
      },
      take: limit,
      select: {
        id: true,
        query: true,
        hitCount: true,
        lastUsedAt: true
      }
    })
    
    // Format the response
    const formattedTrends = trendingSearches.map((search, index) => ({
      rank: index + 1,
      term: search.query,
      searchCount: search.hitCount,
      lastSearched: search.lastUsedAt.toISOString()
    }))
    
    return NextResponse.json({
      success: true,
      data: formattedTrends,
      meta: {
        timeWindow: '24h',
        count: formattedTrends.length,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Trending searches error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch trending searches'
    }, { status: 500 })
  }
}
