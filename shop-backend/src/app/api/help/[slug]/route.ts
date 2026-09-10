import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/help/[slug] Get single help article by slug, increment viewCount
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const article = await prisma.helpArticle.findUnique({
      where: { slug },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Help article not found' },
        { status: 404 }
      )
    }

    // Increment view count (fire and forget)
    prisma.helpArticle.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {
      // Silently ignore increment errors
    })

    // Fetch related articles in the same category
    const related = await prisma.helpArticle.findMany({
      where: {
        category: article.category,
        slug: { not: slug },
        isPublished: true,
      },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        viewCount: true,
      },
    })

    return NextResponse.json({
      ...article,
      viewCount: article.viewCount + 1,
      relatedArticles: related,
    })
  } catch (error) {
    console.error('Error fetching help article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch help article' },
      { status: 500 }
    )
  }
}
