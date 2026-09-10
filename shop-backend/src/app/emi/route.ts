import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get EMI options for a product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const emiOptions = await prisma.eMIOption.findMany({
      where: { productId, isActive: true },
      orderBy: { tenure: 'asc' }
    })

    // Get product price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true, name: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate EMI for each option
    const emiCalculations = emiOptions.map(option => {
      const principal = product.price
      const rate = option.interestRate / 100 / 12
      const months = option.tenure
      
      let monthlyEMI: number
      if (rate === 0) {
        monthlyEMI = principal / months
      } else {
        monthlyEMI = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1)
      }

      const totalPayment = monthlyEMI * months
      const totalInterest = totalPayment - principal

      return {
        ...option,
        productPrice: principal,
        monthlyEMI: Math.round(monthlyEMI * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100
      }
    })

    return NextResponse.json({
      productName: product.name,
      productPrice: product.price,
      emiOptions: emiCalculations
    })
  } catch (error) {
    console.error('EMI fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch EMI options' }, { status: 500 })
  }
}

// POST - Calculate EMI
export async function POST(req: NextRequest) {
  try {
    const { amount, tenure, interestRate = 0 } = await req.json()

    if (!amount || !tenure) {
      return NextResponse.json({ error: 'Amount and tenure required' }, { status: 400 })
    }

    const principal = parseFloat(amount)
    const months = parseInt(tenure)
    const rate = interestRate / 100 / 12

    let monthlyEMI: number
    if (rate === 0) {
      monthlyEMI = principal / months
    } else {
      monthlyEMI = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1)
    }

    const totalPayment = monthlyEMI * months
    const totalInterest = totalPayment - principal

    return NextResponse.json({
      principal,
      tenure: months,
      interestRate,
      monthlyEMI: Math.round(monthlyEMI * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      processingFee: Math.round(principal * 0.02 * 100) / 100 // 2% processing fee
    })
  } catch (error) {
    console.error('EMI calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate EMI' }, { status: 500 })
  }
}

// PUT - Apply for EMI
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, emiOptionId } = await req.json()

    const emiOption = await prisma.eMIOption.findUnique({
      where: { id: emiOptionId }
    })

    if (!emiOption) {
      return NextResponse.json({ error: 'EMI option not found' }, { status: 404 })
    }

    // Create EMI application
    const principal = emiOption.maxAmount || emiOption.minAmount
    const rate = emiOption.interestRate / 100 / 12
    const months = emiOption.tenure
    
    let monthlyEMI: number
    if (rate === 0) {
      monthlyEMI = principal / months
    } else {
      monthlyEMI = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1)
    }

    const totalInterest = (monthlyEMI * months) - principal

    const emiApplication = await prisma.eMIApplication.create({
      data: {
        userId,
        orderId,
        bankId: emiOption.bankId,
        tenure: emiOption.tenure,
        monthlyEMI: Math.round(monthlyEMI * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      emiApplication,
      message: 'EMI application submitted for approval'
    })
  } catch (error) {
    console.error('EMI application error:', error)
    return NextResponse.json({ error: 'Failed to apply for EMI' }, { status: 500 })
  }
}
