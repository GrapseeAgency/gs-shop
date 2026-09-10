import { NextRequest, NextResponse } from 'next/server'

// POST - Compare full payment vs installments
export async function POST(req: NextRequest) {
  try {
    const { productPrice, emiTenure = 12, interestRate = 15, processingFee = 2 } = await req.json()

    const monthlyRate = interestRate / 12 / 100
    
    // EMI formula
    const emi = Math.round(
      productPrice * monthlyRate * Math.pow(1 + monthlyRate, emiTenure) / 
      (Math.pow(1 + monthlyRate, emiTenure) - 1)
    )

    const processingFeeAmount = (productPrice * processingFee) / 100
    const totalWithEMI = (emi * emiTenure) + processingFeeAmount
    const extraCost = totalWithEMI - productPrice

    return NextResponse.json({
      fullPayment: {
        amount: productPrice,
        pros: ['No extra charges', 'Own immediately', 'Better negotiation'],
        cons: ['Large upfront payment']
      },
      emi: {
        monthly: emi,
        tenure: emiTenure,
        total: totalWithEMI,
        processingFee: processingFeeAmount,
        extraCost,
        pros: ['Low monthly burden', 'Better cash flow', 'Build credit score'],
        cons: [`Pay ${extraCost} extra`, 'Processing fees apply']
      },
      comparison: {
        winner: extraCost > productPrice * 0.1 ? 'full' : 'depends',
        message: extraCost > productPrice * 0.1
          ? `EMI costs ${extraCost} extra (${Math.round((extraCost/productPrice)*100)}%). Pay full if possible.`
          : `EMI adds only ${Math.round((extraCost/productPrice)*100)}%. Good for cash flow management.`
      },
      recommendation: extraCost < productPrice * 0.05
        ? 'EMI is reasonable - good for budgeting'
        : extraCost < productPrice * 0.1
        ? 'EMI okay if cash flow is tight'
        : 'Try to pay full amount - save on interest'
    })
  } catch (error) {
    console.error('Installment comparison error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
