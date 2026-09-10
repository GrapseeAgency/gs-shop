import { NextRequest, NextResponse } from 'next/server'

// POST - Calculate resale value and real cost of ownership
export async function POST(req: NextRequest) {
  try {
    const { purchasePrice, category, age, condition, usageHours } = await req.json()

    // Depreciation rates by category
    const depreciation: Record<string, { annual: number; salvage: number }> = {
      'electronics': { annual: 0.25, salvage: 0.2 },
      'phone': { annual: 0.3, salvage: 0.15 },
      'laptop': { annual: 0.25, salvage: 0.2 },
      'tv': { annual: 0.2, salvage: 0.15 },
      'furniture': { annual: 0.1, salvage: 0.3 },
      'clothing': { annual: 0.4, salvage: 0.05 },
      'vehicle': { annual: 0.15, salvage: 0.3 }
    }

    const rate = depreciation[category] || { annual: 0.2, salvage: 0.2 }
    
    // Calculate current value
    const years = age
    let currentValue = purchasePrice * Math.pow(1 - rate.annual, years)
    
    // Adjust for condition
    const conditionMultiplier: Record<string, number> = {
      'excellent': 1,
      'good': 0.8,
      'fair': 0.6,
      'poor': 0.4
    }
    currentValue = currentValue * (conditionMultiplier[condition] || 0.7)
    
    // Ensure minimum salvage value
    currentValue = Math.max(currentValue, purchasePrice * rate.salvage)

    // Calculate real cost of ownership
    const depreciationCost = purchasePrice - currentValue
    const daysOwned = years * 365
    const dailyCost = depreciationCost / daysOwned
    
    // Per use cost (if usage hours provided)
    const perUseCost = usageHours ? depreciationCost / usageHours : null

    return NextResponse.json({
      purchasePrice,
      currentValue: Math.round(currentValue),
      depreciationCost: Math.round(depreciationCost),
      ownership: {
        dailyCost: dailyCost.toFixed(2),
        monthlyCost: (dailyCost * 30).toFixed(2),
        yearlyCost: Math.round(dailyCost * 365)
      },
      perUse: perUseCost ? {
        hours: usageHours,
        costPerHour: perUseCost.toFixed(2),
        message: `Each hour of use cost you ${perUseCost.toFixed(2)}`
      } : null,
      recommendation: {
        sell: currentValue > purchasePrice * 0.3,
        message: currentValue > purchasePrice * 0.3
          ? 'Good time to sell - still retains decent value'
          : 'Keep using - resale value is low now',
        holdLonger: currentValue < purchasePrice * 0.3
      }
    })
  } catch (error) {
    console.error('Resale calculator error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
