// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const GAMES = {
  quiz: {
    name: 'Tech Knowledge Quiz',
    description: 'Test your tech knowledge and win rewards!',
    questions: [
      {
        question: 'What does API stand for?',
        options: ['Application Programming Interface', 'Advanced Protocol Integration', 'Automated Process Interface', 'Application Process Integration'],
        correct: 0
      },
      {
        question: 'Which is NOT a JavaScript framework?',
        options: ['React', 'Vue', 'Django', 'Angular'],
        correct: 2
      },
      {
        question: 'What does CSS stand for?',
        options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets'],
        correct: 1
      },
      {
        question: 'Which database is NoSQL?',
        options: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle'],
        correct: 2
      },
      {
        question: 'What is the main purpose of Docker?',
        options: ['Database management', 'Containerization', 'Frontend development', 'API testing'],
        correct: 1
      }
    ]
  },
  matching: {
    name: 'Tech Stack Matcher',
    description: 'Match technologies with their use cases!',
    pairs: [
      { tech: 'React', use: 'Frontend UI' },
      { tech: 'Node.js', use: 'Backend Runtime' },
      { tech: 'MongoDB', use: 'Database' },
      { tech: 'Docker', use: 'Containerization' },
      { tech: 'AWS', use: 'Cloud Hosting' },
      { tech: 'Redis', use: 'Caching' }
    ]
  },
  memory: {
    name: 'Service Memory',
    description: 'Match pairs of our services!',
    cards: ['Website', 'Mobile App', 'DevOps', 'UI/UX', 'SEO', 'Cloud']
  }
}

// GET - Get game data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const gameType = searchParams.get('type') || 'quiz'

    if (!GAMES[gameType as keyof typeof GAMES]) {
      return NextResponse.json({ error: 'Invalid game type' }, { status: 400 })
    }

    // For quiz, return random questions
    if (gameType === 'quiz') {
      const questions = [...GAMES.quiz.questions]
        .slice(0, 5)

      return NextResponse.json({
        game: {
          ...GAMES.quiz,
          questions
        }
      })
    }

    return NextResponse.json({
      game: GAMES[gameType as keyof typeof GAMES]
    })
  } catch (error) {
    console.error('Mini game fetch error:', error)
    return NextResponse.json({ error: 'Failed to load game' }, { status: 500 })
  }
}

// POST - Submit game score
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { gameType, score, timeTaken } = await req.json()

    if (!GAMES[gameType as keyof typeof GAMES]) {
      return NextResponse.json({ error: 'Invalid game type' }, { status: 400 })
    }

    // Calculate reward
    let rewardType = null
    let rewardValue = 0

    if (score >= 80) {
      rewardType = 'coupon'
      rewardValue = 10 // 10% off
    } else if (score >= 60) {
      rewardType = 'points'
      rewardValue = 50
    } else if (score >= 40) {
      rewardType = 'points'
      rewardValue = 20
    }

    // Create game session record
    const session = await prisma.miniGameSession.create({
      data: {
        userId,
        gameType,
        score,
        rewardType,
        rewardValue
      }
    })

    // Award points if applicable
    if (rewardType === 'points' && rewardValue > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { rewardsPoints: { increment: rewardValue } }
      })
    }

    // Generate coupon if applicable
    let couponCode = null
    if (rewardType === 'coupon') {
      
      await prisma.coupon.create({
        data: {
          code: couponCode,
          discount: rewardValue,
          type: 'percentage',
          maxUses: 1,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    }

    return NextResponse.json({
      success: true,
      session,
      score,
      reward: rewardType ? {
        type: rewardType,
        value: rewardValue,
        couponCode
      } : null,
      message: rewardType 
        ? `Great job! You won ${rewardValue}${rewardType === 'coupon' ? '% off' : ' points'}!`
        : 'Good try! Play again to win rewards.'
    })
  } catch (error) {
    console.error('Mini game submission error:', error)
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 })
  }
}

// GET user game history
export async function GET_history(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.miniGameSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 20
    })

    // Calculate stats
    const totalGames = sessions.length
    const totalPoints = sessions.reduce((sum, s) => sum + (s.rewardType === 'points' ? s.rewardValue : 0), 0)
    const highScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.score)) : 0

    return NextResponse.json({
      sessions,
      stats: {
        totalGames,
        totalPoints,
        highScore,
        winRate: totalGames > 0 ? Math.round((sessions.filter(s => s.score >= 60).length / totalGames) * 100) : 0
      }
    })
  } catch (error) {
    console.error('Game history error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
