import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/installments
export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, price: { gte: 500 } },
      take: 10,
      orderBy: { price: 'desc' },
    })

    const interestRates: Record<number, number> = {
      3: 0,
      6: 2.5,
      9: 4.5,
      12: 6.0,
      18: 9.0,
      24: 12.0,
    }

    const installmentProducts = products.map((product) => {
      const tenures = Object.entries(interestRates).map(([months, rate]) => {
        const totalWithInterest = product.price * (1 + rate / 100)
        const monthlyPayment = Math.round((totalWithInterest / parseInt(months)) * 100) / 100
        return {
          months: parseInt(months),
          interestRate: rate,
          monthlyPayment,
          totalCost: Math.round(totalWithInterest * 100) / 100,
          totalInterest: Math.round((totalWithInterest - product.price) * 100) / 100,
        }
      })

      return {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        minDownPayment: Math.round(product.price * 0.1 * 100) / 100,
        tenures,
        eligible: product.price >= 500,
      }
    })

    return NextResponse.json({
      data: installmentProducts,
      total: installmentProducts.length,
      interestRates,
    })
  } catch (error) {
    console.error('Error fetching installments:', error)
    return NextResponse.json({ error: 'Failed to fetch installments' }, { status: 500 })
  }
}

// POST /api/installments Calculate installment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, tenure = 12, downPayment = 0 } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const interestRates: Record<number, number> = {
      3: 0, 6: 2.5, 9: 4.5, 12: 6.0, 18: 9.0, 24: 12.0,
    }

    const rate = interestRates[tenure] ?? 6.0
    const principal = product.price - downPayment
    const totalWithInterest = principal * (1 + rate / 100)
    const monthlyPayment = Math.round((totalWithInterest / tenure) * 100) / 100

    return NextResponse.json({
      productId: product.id,
      productName: product.name,
      price: product.price,
      downPayment,
      principal: Math.round(principal * 100) / 100,
      tenure,
      interestRate: rate,
      totalInterest: Math.round((totalWithInterest - principal) * 100) / 100,
      totalCost: Math.round(totalWithInterest * 100) / 100,
      monthlyPayment,
    })
  } catch (error) {
    console.error('Error calculating installment:', error)
    return NextResponse.json({ error: 'Failed to calculate installment' }, { status: 500 })
  }
}
