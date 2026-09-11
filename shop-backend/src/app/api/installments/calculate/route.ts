import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, months } = body

    if (!amount || !months) {
      return NextResponse.json(
        { error: 'Amount and months required' },
        { status: 400 }
      )
    }

    // Calculate EMI
    const principal = parseFloat(amount)
    const numMonths = parseInt(months)

    if (principal <= 0 || numMonths < 3 || numMonths > 24) {
      return NextResponse.json(
        { error: 'Invalid amount or months (3-24 allowed)' },
        { status: 400 }
      )
    }

    // Simple interest calculation (0% for this example)
    const interestRate = 0
    const monthlyPayment = principal / numMonths
    const totalPayment = principal
    const totalInterest = 0

    return NextResponse.json({
      principal,
      months: numMonths,
      interestRate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      firstPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  } catch (error) {
    console.error('Error calculating installment:', error)
    return NextResponse.json(
      { error: 'Failed to calculate installment' },
      { status: 500 }
    )
  }
}
