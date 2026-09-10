import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/brands
 * Returns all active brands
 * Shop by Brand feature - shows brands for filtering products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Fetch all active brands
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true
      },
      orderBy: { order: 'asc' },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        icon: true,
        order: true,
        isActive: true,
        createdAt: true
      }
    })

    // If no brands, return empty (silent)
    if (brands.length === 0) {
      return NextResponse.json({
        success: true,
        brands: [],
        meta: {
          count: 0,
          message: 'No brands available'
        }
      })
    }

    return NextResponse.json({
      success: true,
      brands,
      meta: {
        count: brands.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch brands'
    }, { status: 500 })
  }
}
