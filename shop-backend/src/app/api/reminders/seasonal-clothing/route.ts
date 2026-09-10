import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get seasonal clothing reminders
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Determine current season and upcoming
    const month = new Date().getMonth() // 0-11
    const seasons = [
      { name: 'Winter', months: [11, 0, 1], next: 'Spring' },
      { name: 'Spring', months: [2, 3, 4], next: 'Summer' },
      { name: 'Summer', months: [5, 6, 7], next: 'Monsoon' },
      { name: 'Monsoon', months: [8, 9, 10], next: 'Winter' }
    ]
    
    const currentSeason = seasons.find(s => s.months.includes(month))
    const nextSeason = seasons.find(s => s.name === currentSeason?.next)
    
    // Calculate weeks until next season
    const currentMonthIdx = currentSeason?.months.indexOf(month) || 0
    const monthsLeft = 3 - currentMonthIdx
    const weeksUntilNext = monthsLeft * 4

    // Find seasonal products
    const seasonalItems = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { tags: { contains: nextSeason?.name.toLowerCase() } },
          { tags: { contains: currentSeason?.name.toLowerCase() } }
        ]
      },
      take: 8
    })

    return NextResponse.json({
      currentSeason: currentSeason?.name,
      nextSeason: nextSeason?.name,
      weeksUntilNext,
      reminder: weeksUntilNext <= 3
        ? ` ${nextSeason?.name} is coming in ${weeksUntilNext} weeks! Check your wardrobe.`
        : `${currentSeason?.name} is here. Enjoy the season!`,
      suggestions: seasonalItems,
      actionItems: weeksUntilNext <= 3 ? [
        'Bring out stored clothes',
        'Check what needs replacement',
        'Shop for missing essentials'
      ] : []
    })
  } catch (error) {
    console.error('Seasonal reminder error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
