import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Enable voice-guided shopping for visually impaired
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enable } = await req.json()

    if (enable) {
      await prisma.userPreference.upsert({
        where: { userId },
        update: {
          visualImpairedMode: true,
          voiceNavigation: true,
          screenReaderOptimized: true,
          hapticFeedback: true,
          updatedAt: new Date()
        },
        create: {
          userId,
          visualImpairedMode: true,
          voiceNavigation: true,
          screenReaderOptimized: true,
          hapticFeedback: true
        }
      })

      return NextResponse.json({
        enabled: true,
        features: {
          voice: 'Speaks product names, prices, and reviews',
          commands: 'Say "next", "buy", "cart", "search [item]" to navigate',
          feedback: 'Haptic feedback for buttons and actions',
          aria: 'Full ARIA labels for screen readers'
        },
        voiceCommands: [
          'Say "Search [product]" to find items',
          'Say "Read" to hear product details',
          'Say "Add" to add to cart',
          'Say "Cart" to review cart',
          'Say "Checkout" to proceed'
        ],
        message: 'Voice-guided shopping enabled! The app will speak everything.'
      })
    } else {
      await prisma.userPreference.update({
        where: { userId },
        data: { visualImpairedMode: false }
      }).catch(() => {})

      return NextResponse.json({
        enabled: false,
        message: 'Standard mode restored.'
      })
    }
  } catch (error) {
    console.error('Visual impaired mode error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
