import { NextRequest, NextResponse } from 'next/server'

// POST - Calculate and split tips
export async function POST(req: NextRequest) {
  try {
    const { billAmount, tipPercent = 10, people = 1, roundUp = false } = await req.json()

    const tipAmount = (billAmount * tipPercent) / 100
    const totalWithTip = billAmount + tipAmount
    const perPerson = totalWithTip / people

    // Round up option
    const finalPerPerson = roundUp ? Math.ceil(perPerson / 10) * 10 : perPerson
    const finalTotal = finalPerPerson * people

    return NextResponse.json({
      bill: billAmount,
      tip: {
        percent: tipPercent,
        amount: Math.round(tipAmount * 100) / 100
      },
      total: Math.round(finalTotal * 100) / 100,
      split: {
        people,
        perPerson: Math.round(finalPerPerson * 100) / 100
      },
      viaApp: {
        message: 'Split via Grapsee app',
        shareUrl: '/split-bill',
        qrCode: true
      },
      presets: [5, 10, 15, 20].map(p => ({
        percent: p,
        amount: Math.round((billAmount * p) / 100 * 100) / 100
      }))
    })
  } catch (error) {
    console.error('Tip calculator error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
