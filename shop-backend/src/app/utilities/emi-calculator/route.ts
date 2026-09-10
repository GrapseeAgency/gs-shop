import { NextRequest, NextResponse } from 'next/server'

// POST - Calculate EMI and compare options
export async function POST(req: NextRequest) {
  try {
    const { amount, tenure, bankPreference } = await req.json()

    // Bank EMI rates (annual interest)
    const banks = [
      { name: 'HDFC Bank', rate: 12, processingFee: 2 },
      { name: 'ICICI Bank', rate: 11.5, processingFee: 1.5 },
      { name: 'SBI', rate: 10.5, processingFee: 1 },
      { name: 'Axis Bank', rate: 13, processingFee: 2.5 },
      { name: 'Kotak', rate: 11, processingFee: 1.8 }
    ]

    const calculations = banks.map(bank => {
      const monthlyRate = bank.rate / 12 / 100
      const months = tenure
      
      // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
      const emi = Math.round(
        amount * monthlyRate * Math.pow(1 + monthlyRate, months) / 
        (Math.pow(1 + monthlyRate, months) - 1)
      )
      
      const totalPayment = emi * months
      const totalInterest = totalPayment - amount
      const processingFeeAmount = Math.round(amount * bank.processingFee / 100)

      return {
        bank: bank.name,
        rate: bank.rate,
        emi,
        totalInterest,
        processingFee: processingFeeAmount,
        totalCost: totalPayment + processingFeeAmount,
        recommended: bank.rate <= 11
      }
    }).sort((a, b) => a.emi - b.emi)

    const bestOption = calculations[0]
    const worstOption = calculations[calculations.length - 1]
    const totalSavings = worstOption.totalCost - bestOption.totalCost

    return NextResponse.json({
      principal: amount,
      tenure,
      options: calculations,
      bestOption: {
        ...bestOption,
        why: `Lowest EMI of ${bestOption.emi}/month`
      },
      comparison: {
        monthlySavings: worstOption.emi - bestOption.emi,
        totalSavings,
        message: `${bestOption.bank} saves you ${totalSavings} over ${worstOption.bank}`
      },
      recommendation: `Choose ${bestOption.bank} for lowest EMI (${bestOption.emi})`
    })
  } catch (error) {
    console.error('EMI calculator error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
