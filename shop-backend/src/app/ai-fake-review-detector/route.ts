import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Analyze review authenticity
export async function POST(req: NextRequest) {
  try {
    const { reviewId, reviewText, reviewerHistory } = await req.json()

    const analysis = analyzeReview(reviewText, reviewerHistory)

    // If reviewId provided, flag in database
    if (reviewId && analysis.isSuspicious) {
      await prisma.review.update({
        where: { id: reviewId },
        data: {
          isFlagged: true,
          flagReason: JSON.stringify(analysis.flags)
        }
      })
    }

    return NextResponse.json({
      authenticity: {
        score: analysis.authenticityScore,
        isSuspicious: analysis.isSuspicious,
        confidence: analysis.confidence
      },
      flags: analysis.flags,
      indicators: {
        positive: analysis.positiveIndicators,
        negative: analysis.negativeIndicators
      },
      recommendation: analysis.isSuspicious ? 'review_manually' : 'approve'
    })
  } catch (error) {
    console.error('Fake review detection error:', error)
    return NextResponse.json({ error: 'Detection failed' }, { status: 500 })
  }
}

// GET - Get flagged reviews (admin only)
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Check admin
    const user = await prisma.user.findUnique({
      where: { id: userId || '' },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const flagged = await prisma.review.findMany({
      where: { isFlagged: true },
      include: {
        product: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ flagged })
  } catch (error) {
    console.error('Flagged reviews error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

function analyzeReview(text: string, history: any) {
  const flags: string[] = []
  const positiveIndicators: string[] = []
  const negativeIndicators: string[] = []
  
  let score = 100 // Start with perfect score
  
  // Check for generic language
  const genericPhrases = [
    'great product', 'highly recommend', 'good quality', 
    'fast shipping', 'love it', 'amazing', 'perfect'
  ]
  
  const genericCount = genericPhrases.filter(phrase => 
    text.toLowerCase().includes(phrase)
  ).length
  
  if (genericCount > 3) {
    score -= 15
    negativeIndicators.push('Uses generic phrases commonly found in fake reviews')
  }
  
  // Check review length
  if (text.length < 30) {
    score -= 20
    negativeIndicators.push('Review is too short to be helpful')
  }
  
  if (text.length > 500) {
    positiveIndicators.push('Detailed review with specific information')
  }
  
  // Check for excessive punctuation/caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
  if (capsRatio > 0.3) {
    score -= 10
    negativeIndicators.push('Excessive use of capital letters')
  }
  
  const exclamationCount = (text.match(/!/g) || []).length
  if (exclamationCount > 5) {
    score -= 10
    negativeIndicators.push('Excessive enthusiasm (too many exclamation marks)')
  }
  
  // Check reviewer history
  if (history) {
    if (history.reviewCount < 3) {
      score -= 15
      negativeIndicators.push('New reviewer with limited history')
    }
    
    if (history.allPositive && history.reviewCount > 5) {
      score -= 20
      negativeIndicators.push('Suspicious: only leaves 5-star reviews')
    }
    
    if (history.rapidReviews) {
      score -= 25
      negativeIndicators.push('Multiple reviews in short time period')
    }
  }
  
  // Check for specific details (good sign)
  const specificTerms = [
    'after', 'week', 'month', 'use', 'using', 'bought', 'ordered',
    'delivery', 'packaging', 'specific', 'compared', 'instead'
  ]
  
  const hasSpecificTerms = specificTerms.some(term => 
    text.toLowerCase().includes(term)
  )
  
  if (hasSpecificTerms) {
    score += 10
    positiveIndicators.push('Mentions specific usage details')
  }
  
  // Final determination
  score = Math.max(0, Math.min(100, score))

  const isSuspicious = score < 60

  if (score < 40) {
    flags.push('fake')
  } else if (score < 60) {
    flags.push('suspicious')
  }

  // Calculate confidence based on number of indicators found
  // More indicators = higher confidence in the assessment
  const totalIndicators = positiveIndicators.length + negativeIndicators.length
  const baseConfidence = isSuspicious ? 0.6 : 0.5
  const indicatorBoost = Math.min(0.35, totalIndicators * 0.05) // 5% per indicator, max 35%
  const calculatedConfidence = Math.min(0.95, baseConfidence + indicatorBoost)

  return {
    authenticityScore: score,
    isSuspicious,
    confidence: calculatedConfidence,
    flags,
    positiveIndicators,
    negativeIndicators
  }
}
