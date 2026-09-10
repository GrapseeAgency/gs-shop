import { NextRequest, NextResponse } from 'next/server'

// POST - Calculate and compare unit prices
export async function POST(req: NextRequest) {
  try {
    const { products } = await req.json()

    // Calculate unit price for each
    const calculated = products.map((p: any) => {
      const quantity = parseFloat(p.quantity)
      const unit = p.unit // g, kg, ml, l, pcs
      
      // Normalize to base unit
      let baseQuantity = quantity
      if (unit === 'kg') baseQuantity = quantity * 1000 // to grams
      if (unit === 'l') baseQuantity = quantity * 1000 // to ml
      
      const unitPrice = p.price / baseQuantity
      
      return {
        ...p,
        unitPrice: unitPrice.toFixed(3),
        unitPriceDisplay: unit === 'kg' || unit === 'g' 
          ? `${(unitPrice * 1000).toFixed(2)}/kg`
          : unit === 'l' || unit === 'ml'
          ? `${(unitPrice * 1000).toFixed(2)}/L`
          : `${unitPrice.toFixed(2)}/unit`,
        totalValue: p.price
      }
    })

    // Find best deal
    const bestDeal = calculated.reduce((best: any, current: any) => {
      return parseFloat(current.unitPrice) < parseFloat(best.unitPrice) ? current : best
    })

    // Calculate savings vs worst
    const worstDeal = calculated.reduce((worst: any, current: any) => {
      return parseFloat(current.unitPrice) > parseFloat(worst.unitPrice) ? current : worst
    })

    const savingsPercent = Math.round(
      ((parseFloat(worstDeal.unitPrice) - parseFloat(bestDeal.unitPrice)) / parseFloat(worstDeal.unitPrice)) * 100
    )

    return NextResponse.json({
      products: calculated,
      bestDeal: {
        ...bestDeal,
        why: `Lowest unit price at ${bestDeal.unitPriceDisplay}`
      },
      comparison: calculated.map(p => ({
        name: p.name,
        isBest: p.id === bestDeal.id,
        unitPrice: p.unitPriceDisplay,
        diff: p.id !== bestDeal.id 
          ? `${Math.round(((parseFloat(p.unitPrice) - parseFloat(bestDeal.unitPrice)) / parseFloat(bestDeal.unitPrice)) * 100)}% more expensive`
          : 'BEST VALUE'
      })),
      savings: {
        amount: Math.round(worstDeal.price - bestDeal.price),
        percent: savingsPercent,
        message: `Buy ${bestDeal.name} to save ${savingsPercent}% per unit`
      }
    })
  } catch (error) {
    console.error('Unit price error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
