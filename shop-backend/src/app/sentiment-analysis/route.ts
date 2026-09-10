import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get sentiment summary for a product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Get or create sentiment summary
    let summary = await prisma.sentimentSummary.findUnique({
      where: { productId }
    })

    if (!summary) {
      // Calculate from reviews
      const reviews = await prisma.review.findMany({
        where: { productId }
      })

      const positive = reviews.filter(r => r.rating >= 4).length
      const negative = reviews.filter(r => r.rating <= 2).length
      const neutral = reviews.filter(r => r.rating === 3).length

      const total = reviews.length
      const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0

      // Generate AI summary text
      const summaryText = total > 0 
        ? `${positivePercent}% of customers had a positive experience with this product. ${positive} out of ${total} reviews rated it 4 or 5 stars.`
        : 'No reviews yet.'

      summary = await prisma.sentimentSummary.create({
        data: {
          productId,
          positive,
          negative,
          neutral,
          summary: summaryText
        }
      })
    }

    const total = summary.positive + summary.negative + summary.neutral
    const positivePercent = total > 0 ? Math.round((summary.positive / total) * 100) : 0

    return NextResponse.json({
      summary,
      stats: {
        total,
        positive: summary.positive,
        negative: summary.negative,
        neutral: summary.neutral,
        positivePercent
      }
    })
  } catch (error) {
    console.error('Sentiment analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze sentiment' }, { status: 500 })
  }
}

// POST - Analyze and update sentiment
export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json()

    const reviews = await prisma.review.findMany({
      where: { productId }
    })

    const positive = reviews.filter(r => r.rating >= 4).length
    const negative = reviews.filter(r => r.rating <= 2).length
    const neutral = reviews.filter(r => r.rating === 3).length

    const total = reviews.length
    const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0

    const summaryText = total > 0 
      ? `${positivePercent}% of customers had a positive experience. ${positive} positive reviews out of ${total} total.`
      : 'No reviews yet.'

    const summary = await prisma.sentimentSummary.upsert({
      where: { productId },
      update: {
        positive,
        negative,
        neutral,
        summary: summaryText,
        updatedAt: new Date()
      },
      create: {
        productId,
        positive,
        negative,
        neutral,
        summary: summaryText
      }
    })

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error('Sentiment update error:', error)
    return NextResponse.json({ error: 'Failed to update sentiment' }, { status: 500 })
  }
}
