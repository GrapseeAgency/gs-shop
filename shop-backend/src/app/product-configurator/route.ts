import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Price modifiers for options
const priceModifiers: Record<string, Record<string, number>> = {
  color: { 'Midnight Black': 0, 'Pearl White': 10, 'Rose Gold': 20, 'Ocean Blue': 15, 'Stealth Black': 0, 'Arctic Silver': 10, 'Sunset Orange': 15 },
  size: { 'Compact': -20, 'Standard': 0, 'XL': 30, 'Pro': 80 },
  material: { 'Plastic': 0, 'Aluminum': 40, 'Carbon Fiber': 80, 'Titanium': 120, 'Premium Glass': 60 },
  storage: { '64GB': 0, '128GB': 30, '256GB': 60, '512GB': 120, '1TB': 200 },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { isActive: true }
    if (productId) where.productId = productId

    let configurators = await prisma.productConfigurator.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Enrich with product details
    const enriched = await Promise.all(
      configurators.map(async (c) => {
        const product = await prisma.product.findUnique({
          where: { id: c.productId },
          select: { name: true, slug: true, imageUrl: true, price: true },
        })
        return { ...c, product }
      })
    )

    let result = enriched.length > 0 ? enriched : [] as any

    if (productId && result.length === 0) {
      return NextResponse.json(
        { error: 'No configurator found for this product' },
        { status: 404 }
      )
    }

    const finalResult = result.map((c: any) => ({
      ...c,
      options: typeof c.options === 'string' ? JSON.parse(c.options) : c.options,
      priceModifiers,
      totalOptions: Object.keys(typeof c.options === 'string' ? JSON.parse(c.options) : c.options).length,
      totalCombinations: Object.values(typeof c.options === 'string' ? JSON.parse(c.options) : c.options)
        .reduce((acc: number, opts: any) => acc * (Array.isArray(opts) ? opts.length : 1), 1),
    }))

    return NextResponse.json({ configurators: finalResult, total: finalResult.length })
  } catch (error) {
    console.error('Product configurator list error:', error)
    return NextResponse.json(
      { configurators: [].map(c => ({
        ...c,
        options: JSON.parse(c.options),
        priceModifiers,
        totalOptions: 4,
        totalCombinations: 192,
      })), total: [].length },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, selectedOptions } = body

    if (!productId || !selectedOptions) {
      return NextResponse.json(
        { error: 'productId and selectedOptions are required' },
        { status: 400 }
      )
    }

    // Find the configurator
    const configurator = await prisma.productConfigurator.findFirst({
      where: { productId, isActive: true },
    })

    if (!configurator) {
      return NextResponse.json(
        { error: 'No active configurator found for this product' },
        { status: 404 }
      )
    }

    const options = typeof configurator.options === 'string'
      ? JSON.parse(configurator.options)
      : configurator.options

    // Validate selected options
    const validatedOptions: Record<string, { value: string; priceModifier: number }> = {}
    let totalPrice = configurator.basePrice

    for (const [key, value] of Object.entries(selectedOptions)) {
      const availableOptions = options[key]
      if (!availableOptions || !Array.isArray(availableOptions)) {
        return NextResponse.json(
          { error: `Invalid option category: ${key}` },
          { status: 400 }
        )
      }
      if (!availableOptions.includes(value)) {
        return NextResponse.json(
          { error: `Invalid value "${value}" for option "${key}". Available: ${availableOptions.join(', ')}` },
          { status: 400 }
        )
      }

      const modifier = priceModifiers[key]?.[value as string] || 0
      validatedOptions[key] = { value: value as string, priceModifier: modifier }
      totalPrice += modifier
    }

    return NextResponse.json({
      success: true,
      configuration: {
        productId,
        basePrice: configurator.basePrice,
        selectedOptions: validatedOptions,
        totalPrice: Math.round(totalPrice * 100) / 100,
        savings: Math.round((configurator.basePrice * 1.2 - totalPrice) * 100) / 100, // simulated
      },
    })
  } catch (error) {
    console.error('Product configurator save error:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}
