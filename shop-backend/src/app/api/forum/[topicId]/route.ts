import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get topic with replies
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params
  try {
    const [topic, replies] = await Promise.all([
      prisma.forumTopic.findUnique({
        where: { id: topicId }
      }),
      prisma.forumReply.findMany({
        where: { topicId },
        orderBy: { createdAt: 'asc' }
      })
    ])

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.forumTopic.update({
      where: { id: topicId },
      data: { views: { increment: 1 } }
    }).catch(() => {})

    return NextResponse.json({
      topic,
      replies
    })
  } catch (error) {
    console.error('Topic fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 })
  }
}

// POST - Add reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, parentId } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 })
    }

    const reply = await prisma.forumReply.create({
      data: {
        topicId,
        authorId: userId,
        content,
        parentId
      }
    })

    // Update topic reply count
    await prisma.forumTopic.update({
      where: { id: topicId },
      data: { replies: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      reply,
      message: 'Reply posted'
    })
  } catch (error) {
    console.error('Reply creation error:', error)
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 })
  }
}

// PUT - Like topic or reply
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params
  try {
    const { type, replyId } = await req.json()

    if (type === 'topic') {
      await prisma.forumTopic.update({
        where: { id: topicId },
        data: { likes: { increment: 1 } }
      })
    } else if (type === 'reply' && replyId) {
      await prisma.forumReply.update({
        where: { id: replyId },
        data: { likes: { increment: 1 } }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ error: 'Failed to like' }, { status: 500 })
  }
}
