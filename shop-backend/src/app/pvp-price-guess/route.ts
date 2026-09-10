import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get active PvP game
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const gameId = searchParams.get('gameId')

    if (gameId) {
      const game = await prisma.pvpGame.findUnique({
        where: { id: gameId },
        include: {
          product: {
            select: { id: true, name: true, imageUrl: true, price: true }
          },
          guesses: {
            orderBy: { accuracy: 'asc' },
            include: {
              user: { select: { name: true, avatar: true } }
            }
          }
        }
      })

      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 })
      }

      const isComplete = new Date(game.endsAt) < new Date()
      const winner = game.guesses[0]

      return NextResponse.json({
        game: {
          ...game,
          actualPrice: isComplete ? game.product.price : null,
          isComplete,
          winner: isComplete ? winner : null,
          timeRemaining: Math.max(0, new Date(game.endsAt).getTime() - Date.now())
        }
      })
    }

    // Get active games
    const activeGames = await prisma.pvpGame.findMany({
      where: {
        endsAt: { gt: new Date() },
        status: 'active'
      },
      take: 5
    })

    // Fetch products separately
    const productIds = activeGames.map(g => g.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, imageUrl: true, price: true }
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    // Count guesses separately
    const guessCounts = await Promise.all(
      activeGames.map(g => prisma.pvpGuess.count({ where: { gameId: g.id } }))
    )

    return NextResponse.json({
      activeGames: activeGames.map((g, i) => ({
        ...g,
        product: { ...productMap.get(g.productId), price: undefined }, // Hide actual price
        timeRemaining: new Date(g.endsAt).getTime() - Date.now(),
        guessCount: guessCounts[i]
      })),
      totalPlayers: guessCounts.reduce((sum, c) => sum + c, 0)
    })
  } catch (error) {
    console.error('PvP game error:', error)
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 })
  }
}

// POST - Create or join game
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, gameId, guess } = await req.json()

    if (action === 'create') {
      // Create new game with random product
      const products = await prisma.product.findMany({
        where: { isActive: true },
                take: 50
      })
      
      const randomProduct = products[Math.floor(Math.random() * products.length)]

      const game = await prisma.pvpGame.create({
        data: {
          productId: randomProduct.id,
          hostId: userId,
          status: 'active',
          endsAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          prizePool: 100 // Credits
        }
      })

      return NextResponse.json({
        success: true,
        game: {
          id: game.id,
          product: {
            id: randomProduct.id,
            name: randomProduct.name,
            imageUrl: randomProduct.imageUrl
            // No price shown!
          },
          endsAt: game.endsAt,
          inviteCode: game.id.substring(0, 6).toUpperCase()
        }
      })
    }

    if (action === 'guess' && gameId) {
      const game = await prisma.pvpGame.findUnique({
        where: { id: gameId },
        include: { product: true }
      })

      if (!game || new Date(game.endsAt) < new Date()) {
        return NextResponse.json({ error: 'Game ended' }, { status: 400 })
      }

      // Check if already guessed
      const existing = await prisma.pvpGuess.findUnique({
        where: {
          gameId_userId: { gameId, userId }
        }
      })

      if (existing) {
        return NextResponse.json({ error: 'Already guessed' }, { status: 400 })
      }

      // Calculate accuracy
      const actualPrice = game.product.price
      const difference = Math.abs(guess - actualPrice)
      const accuracy = (difference / actualPrice) * 100

      const pvpGuess = await prisma.pvpGuess.create({
        data: {
          gameId,
          userId,
          guess,
          accuracy: difference
        }
      })

      // Check if game should end
      const guessCount = await prisma.pvpGuess.count({
        where: { gameId }
      })

      let isWinner = false
      if (guessCount >= 5 || new Date(game.endsAt) < new Date()) {
        // End game, determine winner
        const allGuesses = await prisma.pvpGuess.findMany({
          where: { gameId },
          orderBy: { accuracy: 'asc' }
        })
        
        if (allGuesses[0]?.userId === userId) {
          isWinner = true
          // Award prize
          await prisma.user.update({
            where: { id: userId },
            data: { rewardsPoints: { increment: game.prizePool } }
          })
        }

        await prisma.pvpGame.update({
          where: { id: gameId },
          data: { status: 'completed' }
        })
      }

      return NextResponse.json({
        success: true,
        guess: pvpGuess,
        difference: difference.toFixed(2),
        percentOff: accuracy.toFixed(1),
        isWinner,
        message: isWinner 
          ? `WINNER! You guessed closest! +${game.prizePool} points!`
          : `Off by $${difference.toFixed(2)} (${accuracy.toFixed(1)}%)`
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('PvP game action error:', error)
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}
