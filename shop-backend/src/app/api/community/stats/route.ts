import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [postCount, commentCount, userCount] = await Promise.all([
      prisma.communityPost.count({ where: { isActive: true } }),
      prisma.communityComment.count(),
      prisma.user.count({ where: { isActive: true } }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        posts: postCount,
        comments: commentCount,
        members: userCount,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
