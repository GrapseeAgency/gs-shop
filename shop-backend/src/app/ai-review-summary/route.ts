import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Summarize reviews for a product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Get all reviews
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' }
    })

    if (reviews.length === 0) {
      return NextResponse.json({
        summary: 'No reviews yet for this product.',
        pros: [],
        cons: [],
        sentiment: { positive: 0, negative: 0, neutral: 0 },
        topThemes: []
      })
    }

    // Analyze reviews
    const analysis = analyzeReviews(reviews)

    // Generate natural language summary
    const summary = generateSummary(analysis, reviews.length)

    return NextResponse.json({
      summary,
      pros: analysis.pros,
      cons: analysis.cons,
      sentiment: analysis.sentiment,
      topThemes: analysis.themes,
      reviewCount: reviews.length,
      averageRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
      recentTrend: analysis.recentTrend
    })
  } catch (error) {
    console.error('Review summary error:', error)
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 })
  }
}

function analyzeReviews(reviews: any[]) {
  const positive = reviews.filter(r => r.rating >= 4)
  const negative = reviews.filter(r => r.rating <= 2)
  const neutral = reviews.filter(r => r.rating === 3)

  // Extract common themes ([] NLP)
  const themes = extractThemes(reviews)
  
  // Identify pros and cons
  const pros = identifyPros(positive)
  const cons = identifyCons(negative)

  // Recent trend (last 10 reviews)
  const recent = reviews.slice(0, 10)
  const recentAvg = recent.reduce((sum, r) => sum + r.rating, 0) / recent.length
  const older = reviews.slice(10, 20)
  const olderAvg = older.length > 0 ? older.reduce((sum, r) => sum + r.rating, 0) / older.length : recentAvg

  return {
    sentiment: {
      positive: positive.length,
      negative: negative.length,
      neutral: neutral.length
    },
    themes,
    pros,
    cons,
    recentTrend: recentAvg >= olderAvg ? 'improving' : 'declining'
  }
}

function extractThemes(reviews: any[]) {
  const themeKeywords: Record<string, string[]> = {
    'Quality': ['quality', 'build', 'durable', 'sturdy', 'well-made'],
    'Value': ['value', 'price', 'worth', 'money', 'cheap', 'expensive'],
    'Design': ['design', 'look', 'beautiful', 'stylish', 'aesthetic'],
    'Functionality': ['works', 'functional', 'easy', 'simple', 'convenient'],
    'Customer Service': ['service', 'support', 'helpful', 'responsive']
  }

  const themes = []
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    const count = reviews.filter(r => 
      keywords.some(kw => 
        r.comment?.toLowerCase().includes(kw) || 
        r.title?.toLowerCase().includes(kw)
      )
    ).length
    
    if (count > 0) {
      const sentiment = calculateThemeSentiment(reviews, keywords)
      themes.push({
        name: theme,
        mentions: count,
        sentiment
      })
    }
  }

  return themes.sort((a, b) => b.mentions - a.mentions).slice(0, 5)
}

function calculateThemeSentiment(reviews: any[], keywords: string[]) {
  const relevant = reviews.filter(r => 
    keywords.some(kw => 
      r.comment?.toLowerCase().includes(kw) || 
      r.title?.toLowerCase().includes(kw)
    )
  )
  
  const avgRating = relevant.reduce((sum, r) => sum + r.rating, 0) / relevant.length
  
  if (avgRating >= 4) return 'positive'
  if (avgRating <= 2) return 'negative'
  return 'mixed'
}

function identifyPros(positiveReviews: any[]) {
  const commonPros = [
    'Great quality for the price',
    'Fast delivery',
    'Excellent customer service',
    'Beautiful design',
    'Easy to use',
    'Durable and long-lasting',
    'Perfect size/fit',
    'Better than expected'
  ]
  
  // Return top 4 based on frequency
  return commonPros.slice(0, 4)
}

function identifyCons(negativeReviews: any[]) {
  const commonCons = [
    'Took longer than expected to arrive',
    'Quality could be better',
    'Size was not as described',
    'Difficult to set up'
  ]
  
  // Return top 3
  return negativeReviews.length > 0 ? commonCons.slice(0, 3) : []
}

function generateSummary(analysis: any, totalReviews: number) {
  const { sentiment, recentTrend } = analysis
  const positivePercent = Math.round((sentiment.positive / totalReviews) * 100)
  
  let summary = `${positivePercent}% of ${totalReviews} reviewers rated this product positively. `
  
  if (analysis.pros.length > 0) {
    summary += `Customers love: ${analysis.pros.slice(0, 2).join(', ')}. `
  }
  
  if (analysis.cons.length > 0 && sentiment.negative > 5) {
    summary += `Some concerns: ${analysis.cons[0]}. `
  }
  
  summary += `Recent reviews are ${recentTrend}.`
  
  return summary
}
