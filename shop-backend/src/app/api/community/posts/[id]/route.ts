import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        postComments: { orderBy: { createdAt: 'asc' } },
                ...(userId ? { postLikes: { where: { userId }, select: { id: true } } } : {}),
      },
    })

    if (!post || !post.isActive) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

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
    console.error('[COMMUNITY POST GET]', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    const post = await prisma.communityPost.findUnique({ where: { id } })
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const user = session?.user as any
    const isAdmin = user?.role === 'admin'
    if (post.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.communityPost.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true, message: 'Post deleted' })
  } catch (error) {
    console.error('[COMMUNITY POST DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
