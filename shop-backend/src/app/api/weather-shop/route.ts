import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const condition = searchParams.get('condition') || 'sunny'
    const temp = parseInt(searchParams.get('temp') || '20')

    // Weather-based product mapping
    const weatherProducts: Record<string, string[]> = {
      sunny: ['sunscreen', 'sunglasses', 'summer', 'outdoor', 'cooler', 'fan'],
      rainy: ['umbrella', 'raincoat', 'waterproof', 'boots', 'indoor', 'tea'],
      cloudy: ['light jacket', 'sweater', 'cozy', 'blanket', 'indoor activities'],
      snowy: ['heater', 'winter', 'warm', 'cozy', 'hot chocolate', 'blanket']
    }

    const keywords = weatherProducts[condition] || ['general']

    // Find matching products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: keywords.map(kw => ({
          OR: [
            { name: { contains: kw } },
            { tags: { contains: kw } },
            { description: { contains: kw } }
          ]
        }))
      },
      take: 8
    })

    // Temperature-based additions
    let tempProducts: any[] = []
    if (temp > 30) {
      tempProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: 'cooling' } },
            { name: { contains: 'AC' } },
            { name: { contains: 'fan' } }
          ]
        },
        take: 4
      })
    } else if (temp < 10) {
      tempProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: 'heater' } },
            { name: { contains: 'warm' } },
            { name: { contains: 'winter' } }
          ]
        },
        take: 4
      })
    }

    const allProducts = [...products, ...tempProducts]
    
    // Remove duplicates
    const uniqueProducts = allProducts.filter((p, i, arr) => 
      arr.findIndex(t => t.id === p.id) === i
    )

    return NextResponse.json({
      weather: { condition, temp },
      products: uniqueProducts,
      message: `Showing products perfect for ${condition} weather at ${temp}C`
    })
  } catch (error) {
    console.error('Weather shop error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
