import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get user's need vs want ratio
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ needs: 0, wants: 0, ratio: 50 })
    }

    const tagged = await prisma.needWantTag.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    const needs = tagged.filter(t => t.type === 'need').length
    const wants = tagged.filter(t => t.type === 'want').length
    const total = needs + wants

    return NextResponse.json({
      needs,
      wants,
      ratio: total > 0 ? (needs / total) * 100 : 50,
      total,
      balance: needs > wants * 2 ? 'need-heavy' : wants > needs * 2 ? 'want-heavy' : 'balanced',
      suggestion: needs > wants * 2 
        ? 'You\'re prioritizing needs well! Treat yourself sometimes.'
        : wants > needs * 2
        ? 'Consider focusing more on essential purchases.'
        : 'Great balance between needs and wants!'
    })
  } catch (error) {
    console.error('Need/want error:', error)
    return NextResponse.json({ needs: 0, wants: 0, ratio: 50 })
  }
}

// POST - Tag an item as need or want
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, productName, type, reason } = await req.json()

    const tag = await prisma.needWantTag.create({
      data: {
        userId,
        productId,
        tag: type || 'need',
        type: type || 'need',
        reason
      }
    })

    return NextResponse.json({
      success: true,
      tag,
      message: `Tagged as ${type}: ${productName}`,
      insight: type === 'need'
        ? 'Essential purchase - makes sense!'
        : 'Treat yourself - you deserve it!'
    })
  } catch (error) {
    console.error('Tag error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
