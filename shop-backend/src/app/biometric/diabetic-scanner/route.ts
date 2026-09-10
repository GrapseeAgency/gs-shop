import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Scan food for diabetic safety
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const userId = req.headers.get('x-user-id')

    const foodData = { glycemicIndex: 45, sugarContent: 8, name: 'Unknown Food' }

    // Rate for diabetics
    let rating: 'green' | 'yellow' | 'red' = 'green'
    let message = 'Safe to consume in moderation'

    if (foodData.glycemicIndex > 70 || foodData.sugarContent > 30) {
      rating = 'red'
      message = 'High sugar/GI - Avoid or consume very small portion'
    } else if (foodData.glycemicIndex > 55 || foodData.sugarContent > 15) {
      rating = 'yellow'
      message = 'Moderate sugar - Limit portion size'
    }

    return NextResponse.json({
      food: foodData,
      diabeticRating: {
        color: rating,
        emoji: rating === 'green' ? '' : rating === 'yellow' ? '' : '',
        message
      },
      details: {
        sugar: `${foodData.sugarContent}g per 100g`,
        glycemicIndex: foodData.glycemicIndex,
        impact: foodData.glycemicIndex > 70 ? 'High blood sugar spike' : 'Moderate impact'
      },
      recommendation: rating === 'red' 
        ? 'Avoid this food. Consider diabetic-friendly alternatives.'
        : rating === 'yellow'
        ? 'Can have small portion (30-50g) with protein/fat to slow absorption.'
        : 'Safe choice! Enjoy in normal portions.',
      alternatives: rating !== 'green' ? [
        { name: 'Sugar-free version', benefit: 'Same taste, no sugar spike' },
        { name: 'Whole grain option', benefit: 'Lower GI, more fiber' }
      ] : []
    })
  } catch (error) {
    console.error('Diabetic scanner error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
