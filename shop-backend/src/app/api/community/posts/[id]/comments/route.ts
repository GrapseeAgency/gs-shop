import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const comments = await prisma.communityComment.findMany({
      where: { postId: id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ success: true, comments })
  } catch (error) {
    console.error('[COMMUNITY COMMENTS GET]', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    const body = await req.json()
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })
    }

    const post = await prisma.communityPost.findUnique({ where: { id } })
    if (!post || !post.isActive) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const comment = await prisma.communityComment.create({
      data: {
        postId: id,
        userId: user?.id || null,
        authorName: user?.name || 'Anonymous',
        avatar: user?.image || null,
        content: content.trim(),
      },
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error('[COMMUNITY COMMENTS POST]', error)
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
  }
}
