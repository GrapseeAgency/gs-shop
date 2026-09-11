import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string

    if (!userId) {
      return NextResponse.json({ error: 'Sign in to like posts' }, { status: 401 })
    }

    const post = await prisma.communityPost.findUnique({ where: { id } })
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const existing = await prisma.communityLike.findUnique({
      where: { postId_userId: { postId: id, userId } },
    })

    if (existing) {
      await prisma.communityLike.delete({ where: { postId_userId: { postId: id, userId } } })
      const updated = await prisma.communityPost.update({
        where: { id },
        data: { likes: { decrement: 1 } },
      })
      return NextResponse.json({ success: true, liked: false, likes: updated.likes })
    } else {
      await prisma.communityLike.create({ data: { postId: id, userId } })
      const updated = await prisma.communityPost.update({
        where: { id },
        data: { likes: { increment: 1 } },
      })
      return NextResponse.json({ success: true, liked: true, likes: updated.likes })
    }
  } catch (error) {
    console.error('[COMMUNITY LIKE]', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
