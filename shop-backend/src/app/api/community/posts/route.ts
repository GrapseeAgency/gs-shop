import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const type = searchParams.get('type') || undefined

    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    const where = {
      isActive: true,
      ...(type && type !== 'all' ? { type } : {}),
    }

    const [total, posts] = await Promise.all([
      prisma.communityPost.count({ where
      }),
      prisma.communityPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
                    ...(userId ? { postLikes: { where: { userId }, select: { id: true } } } : {}),
        },
      }),
    ])

    const enriched = posts.map((post) => {
      const images = post.images ? JSON.parse(post.images) : []
      const taggedProductIds = post.taggedProductIds ? JSON.parse(post.taggedProductIds) : []
      const liked = userId ? (post as any).postLikes?.length > 0 : false
      return {
        id: post.id,
        author: post.author,
        avatar: post.avatar,
        userId: post.userId,
        content: post.content,
        images,
        taggedProductIds,
        likes: post.likes,
        shares: post.shares,
        comments: 0,
        type: post.type,
        liked,
        createdAt: post.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      posts: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error('[COMMUNITY-POSTS GET]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    const body = await request.json()
    const { content, type, images, taggedProductIds } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const validTypes = ['review', 'style', 'haul', 'tip', 'question']
    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid post type' }, { status: 400 })
    }

    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (typeof img !== 'string') continue
        const sizeInBytes = Math.ceil((img.length * 3) / 4)
        if (sizeInBytes > 5 * 1024 * 1024) {
          return NextResponse.json({ error: 'Each image must be under 5MB' }, { status: 400 })
        }
      }
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: user?.id || null,
        author: user?.name || 'Anonymous',
        avatar: user?.image || null,
        content: content.trim(),
        type: type || 'review',
        images: images?.length ? JSON.stringify(images) : null,
        taggedProductIds: taggedProductIds?.length ? JSON.stringify(taggedProductIds) : null,
      },
    })

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        images: post.images ? JSON.parse(post.images) : [],
        taggedProductIds: post.taggedProductIds ? JSON.parse(post.taggedProductIds) : [],
        comments: 0,
        liked: false,
      },
    })
  } catch (error) {
    console.error('[COMMUNITY-POSTS POST]', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
