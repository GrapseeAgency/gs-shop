// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get size evolution predictions
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { searchParams } = new URL(req.url)
    const childId = searchParams.get('childId') // For kids

    if (!userId) {
      return NextResponse.json({ predictions: [] })
    }

    const profile = await prisma.userBiometricProfile.findUnique({
      where: { userId }
    })

    if (!profile) {
      return NextResponse.json({ predictions: [] })
    }

    // Get historical size data
    const history = profile.sizeHistory ? JSON.parse(profile.sizeHistory) : []

    // Predict future sizes
    const predictions = []
    const currentDate = new Date()

    for (let i = 1; i <= 12; i++) {
      const futureDate = new Date(currentDate)
      futureDate.setMonth(futureDate.getMonth() + i)

      // Simple growth prediction (would use ML in real implementation)
      const growthRate = i <= 3 ? 0.5 : i <= 6 ? 0.3 : 0.1 // cm per month
      const currentSize = profile.shoeSize || 0
      const predictedSize = currentSize + (growthRate * i)

      predictions.push({
        month: futureDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        predictedSize: Math.round(predictedSize * 2) / 2, // Round to 0.5
        confidence: Math.max(50, 100 - (i * 5)),
        buyRecommendation: i <= 3 ? 'current' : i <= 6 ? 'buy_next' : 'wait'
      })
    }

    return NextResponse.json({
      currentSize: profile.shoeSize,
      lastMeasured: profile.lastMeasured,
      predictions,
      recommendations: generateSizeRecommendations(predictions, profile)
    })
  } catch (error) {
    console.error('Size evolution error:', error)
    return NextResponse.json({ predictions: [] })
  }
}

function generateSizeRecommendations(predictions: any[], profile: any) {
  const recommendations = []
  
  const next3Months = predictions.slice(0, 3)
  const growingFast = next3Months.every((p, i, arr) => 
    i === 0 || p.predictedSize > arr[i-1].predictedSize
  )

  if (growingFast) {
    recommendations.push({
      type: 'warning',
      message: 'Rapid growth detected! Buy slightly larger sizes.',
      priority: 'high'
    })
  }

  recommendations.push({
    type: 'tip',
    message: 'Measure every 2-3 months for accurate predictions',
    priority: 'medium'
  })

  return recommendations
}
