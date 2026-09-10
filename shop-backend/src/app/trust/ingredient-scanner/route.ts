import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Scan ingredients and decode them
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const productId = formData.get('productId') as string

        const ingredientDB: Record<string, { rating: 'good' | 'neutral' | 'bad'; description: string }> = {
      'parabens': { rating: 'bad', description: 'Preservatives linked to hormone disruption' },
      'sulfates': { rating: 'neutral', description: 'Cleansing agents that may dry skin' },
      'parfum': { rating: 'neutral', description: 'Fragrance - may irritate sensitive skin' },
      'mineral oil': { rating: 'bad', description: 'Petroleum byproduct - comedogenic' },
      'aloe vera': { rating: 'good', description: 'Soothing, hydrating natural ingredient' },
      'vitamin c': { rating: 'good', description: 'Antioxidant, brightens skin' },
      'hyaluronic acid': { rating: 'good', description: 'Hydrating, plumping' },
      'retinol': { rating: 'neutral', description: 'Anti-aging - use with SPF' },
      'sodium benzoate': { rating: 'neutral', description: 'Food-grade preservative' },
      'palm oil': { rating: 'bad', description: 'Environmental concern - unsustainable sourcing' }
    }

        // Decode ingredients
    const decoded = [].map(ing => {
      const info = ingredientDB[ing.toLowerCase()] || {
        rating: 'neutral',
        description: 'Common cosmetic ingredient'
      }

      return {
        name: ing,
        rating: info.rating,
        description: info.description,
        icon: info.rating === 'good' ? '' : info.rating === 'bad' ? '' : ''
      }
    })

    // Calculate safety score
    const good = decoded.filter(i => i.rating === 'good').length
    const bad = decoded.filter(i => i.rating === 'bad').length
    const safetyScore = Math.round((good / decoded.length) * 100)

    return NextResponse.json({
      success: true,
      ingredients: decoded,
      safetyScore,
      summary: {
        good,
        bad,
        neutral: decoded.length - good - bad
      },
      verdict: bad === 0
        ? ' Safe ingredients!'
        : bad <= 2
        ? ' Mostly safe, review flagged ingredients'
        : ' Several concerning ingredients found',
      recommendations: bad > 0
        ? decoded.filter(i => i.rating === 'bad').map(i => `Consider avoiding: ${i.name}`)
        : ['Great choice! All ingredients look safe.']
    })
  } catch (error) {
    console.error('Ingredient scanner error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
