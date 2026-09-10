import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const zone = searchParams.get('zone')

    const where: any = { isActive: true }
    if (zone) {
      where.zone = zone
    }

    const placements = await prisma.customPlacement.findMany({
      where,
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      count: placements.length,
      placements
    })

  } catch (error) {
    console.error('Fetch placements error:', error)
    return NextResponse.json({ error: 'Failed to fetch placements' }, { status: 500 })
  }
}
