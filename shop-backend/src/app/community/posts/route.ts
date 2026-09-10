import { NextRequest, NextResponse } from 'next/server'

// In-memory store for community posts (no Community model in Prisma)
const communityPosts: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))

    const totalPosts = communityPosts.length
    const totalPages = Math.ceil(totalPosts / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPosts = communityPosts.slice(startIndex, endIndex)

    // Add computed fields
    const enrichedPosts = paginatedPosts.map((post) => ({
      ...post,
      timeAgo: getTimeAgo(post.createdAt),
      isLikedByUser: false,
      isBookmarked: false,
    }))

    return NextResponse.json({
      success: true,
      posts: enrichedPosts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages,
        hasMore: page < totalPages,
      },
      meta: {
        title: ' Community',
        subtitle: 'See what others are saying about their purchases',
        
        
        
      },
    })
  } catch (error) {
    console.error('[COMMUNITY-POSTS] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community posts' },
      { status: 500 }
    )
  }
}

function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
