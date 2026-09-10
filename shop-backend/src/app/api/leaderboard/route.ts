import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CATEGORIES = ['top_buyer', 'top_reviewer', 'top_referrer', 'top_earner']
const PERIODS = ['weekly', 'monthly', 'all_time']

// GET - Get leaderboard
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || 'top_buyer'
    const period = searchParams.get('period') || 'monthly'
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'monthly') {
      startDate.setMonth(now.getMonth() - 1)
    } else {
      startDate = new Date(0) // All time
    }

    // Get leaderboard data
    let leaderboard = await prisma.leaderboard.findMany({
      where: {
        category,
        period,
        updatedAt: { gte: startDate }
      },
      orderBy: { score: 'desc' },
      take: limit
    })

    // If no data, generate from users
    if (leaderboard.length === 0) {
      const users = await prisma.user.findMany({
        take: limit,
        orderBy: { rewardsPoints: 'desc' },
        select: {
          id: true,
          name: true,
          avatar: true,
          rewardsPoints: true
        }
      })

      leaderboard = users.map((user, index) => ({
        id: `gen-${user.id}`,
        userId: user.id,
        userName: user.name,
        avatar: user.avatar,
        category,
        score: user.rewardsPoints,
        rank: index + 1,
        period,
        updatedAt: new Date()
      }))
    }

    // Add rank if not set
    leaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: entry.rank || index + 1
    }))

    // Get current user's rank if authenticated
    const userId = req.headers.get('x-user-id')
    let userRank = null

    if (userId) {
      const userEntry = leaderboard.find(e => e.userId === userId)
      if (userEntry) {
        userRank = userEntry
      } else {
        // Calculate user's rank
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, avatar: true, rewardsPoints: true }
        })
        
        if (user) {
          const rankBelow = leaderboard.filter(e => e.score > user.rewardsPoints).length
          userRank = {
            userId,
            userName: user.name,
            avatar: user.avatar,
            score: user.rewardsPoints,
            rank: rankBelow + 1,
            isCurrentUser: true
          }
        }
      }
    }

    return NextResponse.json({
      leaderboard: leaderboard.slice(0, 20), // Top 20
      userRank,
      category,
      period,
      totalParticipants: leaderboard.length
    })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

// POST - Update leaderboard (cron job or trigger)
export async function POST(req: NextRequest) {
  try {
    // This would be called by a cron job to update rankings
    const { category } = await req.json()

    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Get top users for this category
    let topUsers: any[] = []

    if (category === 'top_buyer') {
      const orders = await prisma.order.findMany({
        select: { customerEmail: true },
        take: 100
      })
      const emailCounts: Record<string, number> = {}
      orders.forEach(o => {
        emailCounts[o.customerEmail] = (emailCounts[o.customerEmail] || 0) + 1
      })
      topUsers = Object.entries(emailCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([email, count]) => ({ email, score: count }))
    } else if (category === 'top_reviewer') {
      const reviews = await prisma.review.findMany({
        select: { author: true },
        take: 100
      })
      const authorCounts: Record<string, number> = {}
      reviews.forEach(r => {
        if (r.author) authorCounts[r.author] = (authorCounts[r.author] || 0) + 1
      })
      topUsers = Object.entries(authorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([name, count]) => ({ name, score: count }))
    } else {
      // Default to points
      const users = await prisma.user.findMany({
        orderBy: { rewardsPoints: 'desc' },
        take: 100
      })
      
      topUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        score: u.rewardsPoints
      }))
    }

    // Update leaderboard entries
    for (const period of PERIODS) {
      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i]
        
        await prisma.leaderboard.upsert({
          where: {
            id: `${user.id || user.email || user.name}-${category}-${period}`
          },
          update: {
            score: user.score,
            rank: i + 1,
            updatedAt: new Date()
          },
          create: {
            userId: user.id || `anon-${i}`,
            userName: user.name || user.email || `User ${i + 1}`,
            category,
            score: user.score,
            rank: i + 1,
            period,
            updatedAt: new Date()
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      updated: topUsers.length,
      message: `Leaderboard updated for ${category}`
    })
  } catch (error) {
    console.error('Leaderboard update error:', error)
    return NextResponse.json({ error: 'Failed to update leaderboard' }, { status: 500 })
  }
}
