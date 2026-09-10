// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Find tax-deductible purchases
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ deductions: [] })
    }

    const financialYear = new Date().getFullYear()
    const startOfYear = new Date(`${financialYear}-04-01`)
    const endOfYear = new Date(`${financialYear + 1}-03-31`)

    const orders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        createdAt: { gte: startOfYear, lte: endOfYear },
        status: { not: 'cancelled' }
      },
      include: {
        items: { include: { product: true } }
      }
    })

    const deductions: any[] = []
    const categories: Record<string, { amount: number; items: any[] }> = {
      'medical': { amount: 0, items: [] },
      'education': { amount: 0, items: [] },
      'home_office': { amount: 0, items: [] },
      'business': { amount: 0, items: [] }
    }

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product
        if (!product) continue

        // Check for tax-deductible categories
        const category = product.category?.name?.toLowerCase() || ''
        const tags = product.tags?.toLowerCase() || ''

        if (category.includes('medicine') || category.includes('health') || tags.includes('medical')) {
          categories.medical.amount += item.price * item.quantity
          categories.medical.items.push(product)
        }

        if (category.includes('book') || category.includes('education') || tags.includes('study')) {
          categories.education.amount += item.price * item.quantity
          categories.education.items.push(product)
        }

        if (tags.includes('office') || category.includes('furniture') || tags.includes('work')) {
          categories.home_office.amount += item.price * item.quantity
          categories.home_office.items.push(product)
        }
      }
    }

    const totalDeductions = Object.values(categories).reduce((sum, c) => sum + c.amount, 0)
    const estimatedRefund = Math.round(totalDeductions * 0.3) // Assuming 30% tax bracket

    return NextResponse.json({
      financialYear: `${financialYear}-${financialYear + 1}`,
      categories,
      totalDeductions,
      estimatedRefund,
      reportReady: true,
      downloadUrl: `/reports/tax/${userId}/${financialYear}`,
      message: totalDeductions > 0
        ? `Found ${totalDeductions} in tax-deductible purchases! Estimated refund: ${estimatedRefund}`
        : 'No tax-deductible purchases found this year.',
      eligibleSections: [
        { section: '80D', description: 'Medical expenses', maxLimit: 25000 },
        { section: '80E', description: 'Education loan interest', maxLimit: 'No limit' },
        { section: '80C', description: 'Investments & expenses', maxLimit: 150000 }
      ]
    })
  } catch (error) {
    console.error('Tax refund error:', error)
    return NextResponse.json({ deductions: [] })
  }
}
