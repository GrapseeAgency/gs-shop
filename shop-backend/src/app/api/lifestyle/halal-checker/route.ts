// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Check halal status
export async function POST(req: NextRequest) {
  try {
    const { barcode, productId } = await req.json()

    
    const halalDB: Record<string, { status: 'halal' | 'haram' | 'doubtful'; reason: string }> = {
      '8901234567890': { status: 'halal', reason: 'Certified by Halal India' },
      '8901234567891': { status: 'haram', reason: 'Contains pork gelatin' },
      '8901234567892': { status: 'doubtful', reason: 'Source of enzymes unclear' }
    }

    let result = halalDB[barcode]

    if (!result && productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })
      
      if (product) {
        const ingredients = product.ingredients?.toLowerCase() || ''
        
        if (ingredients.includes('pork') || ingredients.includes('lard')) {
          result = { status: 'haram', reason: 'Contains pork derivatives' }
        } else if (ingredients.includes('alcohol')) {
          result = { status: 'haram', reason: 'Contains alcohol' }
        } else if (product.tags?.includes('halal-certified')) {
          result = { status: 'halal', reason: 'Halal certified product' }
        } else {
          result = { status: 'doubtful', reason: 'Check ingredients list' }
        }
      }
    }

    result = result || { status: 'doubtful', reason: 'No data available' }

    return NextResponse.json({
      barcode,
      productId,
      status: result.status,
      icon: result.status === 'halal' ? '' : result.status === 'haram' ? '' : '',
      reason: result.reason,
      ingredients: result.status === 'halal' ? null : 'Review full ingredient list',
      alternatives: result.status !== 'halal' ? [
        { name: 'Halal-certified alternative', status: 'halal' }
      ] : null
    })
  } catch (error) {
    console.error('Halal checker error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
