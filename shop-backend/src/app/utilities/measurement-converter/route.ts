import { NextRequest, NextResponse } from 'next/server'

// POST - Convert cooking measurements
export async function POST(req: NextRequest) {
  try {
    const { amount, from, to, ingredient } = await req.json()

    // Conversion rates (approximate for cooking)
    const conversions: Record<string, Record<string, number>> = {
      'cup': {
        'gram': 240,
        'ml': 240,
        'tbsp': 16,
        'tsp': 48,
        'oz': 8
      },
      'tbsp': {
        'gram': 15,
        'ml': 15,
        'tsp': 3
      },
      'tsp': {
        'gram': 5,
        'ml': 5
      },
      'oz': {
        'gram': 28.35,
        'ml': 29.57
      },
      'lb': {
        'gram': 453.59,
        'kg': 0.4536
      }
    }

    // Ingredient-specific densities
    const densities: Record<string, number> = {
      'flour': 0.5, // 1 cup = 120g
      'sugar': 0.85,
      'rice': 0.75,
      'milk': 1,
      'water': 1,
      'oil': 0.92,
      'butter': 0.96,
      'honey': 1.42
    }

    let result = amount
    let conversionRate = 1

    if (conversions[from] && conversions[from][to]) {
      conversionRate = conversions[from][to]
      
      // Adjust for ingredient density if converting to/from weight
      if (ingredient && densities[ingredient.toLowerCase()]) {
        if ((from === 'cup' || from === 'tbsp') && (to === 'gram' || to === 'kg')) {
          conversionRate *= densities[ingredient.toLowerCase()]
        }
      }
      
      result = amount * conversionRate
    }

    return NextResponse.json({
      input: { amount, from, to, ingredient },
      result: {
        value: Math.round(result * 100) / 100,
        unit: to
      },
      equivalent: {
        display: `${amount} ${from} = ${Math.round(result * 100) / 100} ${to}`,
        commonAlternatives: getCommonAlternatives(amount, from, ingredient)
      },
      message: `Recipe says ${amount} ${from} of ${ingredient || 'ingredient'} = ${Math.round(result * 100) / 100} ${to}`
    })
  } catch (error) {
    console.error('Measurement error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function getCommonAlternatives(amount: number, from: string, ingredient?: string): string[] {
  const alternatives: string[] = []
  
  if (from === 'cup') {
    alternatives.push(`${amount * 16} tablespoons`)
    alternatives.push(`${amount * 48} teaspoons`)
  }
  if (from === 'tbsp') {
    alternatives.push(`${amount * 3} teaspoons`)
  }
  
  return alternatives
}
