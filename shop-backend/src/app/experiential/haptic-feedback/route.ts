import { NextRequest, NextResponse } from 'next/server'

// GET - Get haptic feedback settings and patterns
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const deviceType = searchParams.get('deviceType') || 'mobile'

    const patterns = {
      add_to_cart: { type: 'light', duration: 50 },
      purchase_success: { type: 'success', duration: 100 },
      error: { type: 'error', duration: 80 },
      notification: { type: 'tap', duration: 30 },
      scroll_end: { type: 'light', duration: 20 },
      pull_to_refresh: { type: 'medium', duration: 60 }
    }

    return NextResponse.json({
      enabled: deviceType === 'mobile',
      patterns,
      supported: deviceType === 'mobile',
      settings: {
        intensity: 'medium',
        enabled: true,
        silentMode: false
      }
    })
  } catch (error) {
    console.error('Haptic settings error:', error)
    return NextResponse.json({ enabled: false })
  }
}

// POST - Trigger haptic feedback event
export async function POST(req: NextRequest) {
  try {
    const { event, intensity = 'medium' } = await req.json()

    const feedbackPatterns: Record<string, any> = {
      add_to_cart: {
        pattern: [50],
        type: 'selection',
        description: 'Light tap confirming item added'
      },
      remove_from_cart: {
        pattern: [30, 30],
        type: 'deletion',
        description: 'Double tap for removal'
      },
      purchase_complete: {
        pattern: [100, 50, 100],
        type: 'success',
        description: 'Celebration pattern for successful purchase'
      },
      error: {
        pattern: [80, 40, 80],
        type: 'error',
        description: 'Triple buzz for errors'
      },
      scroll_tick: {
        pattern: [10],
        type: 'feedback',
        description: 'Micro feedback while scrolling'
      },
      price_drop: {
        pattern: [60, 100],
        type: 'notification',
        description: 'Rising pattern for good news'
      }
    }

    const pattern = feedbackPatterns[event] || feedbackPatterns.add_to_cart

    return NextResponse.json({
      triggered: true,
      pattern,
      intensity,
      deviceSupport: {
        iOS: true,
        Android: true,
        web: 'vibration_api'
      }
    })
  } catch (error) {
    console.error('Haptic trigger error:', error)
    return NextResponse.json({ triggered: false })
  }
}
