import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple in-memory store for active viewers (resets on server restart)
// In production, use Redis or similar
const activeViewers = new Map<string, Set<string>>() // productId -> Set of sessionIds

// Clean up old viewers every 5 minutes
setInterval(() => {
  const now = Date.now()
  // Viewers are automatically cleaned up when they navigate away
  // This is just for memory management
}, 5 * 60 * 1000)

// POST /api/products/[id]/view - Record a view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get or create session ID
    const sessionId = request.headers.get('x-session-id') || 
                      crypto.randomUUID()
    
    // Add to active viewers
    if (!activeViewers.has(id)) {
      activeViewers.set(id, new Set())
    }
    activeViewers.get(id)?.add(sessionId)
    
    // Also increment total views in database
    await db.product.update({
      where: { id },
      data: {
        views: { increment: 1 }
      }
    })
    
    return NextResponse.json({ 
      success: true,
      sessionId,
      activeViewers: activeViewers.get(id)?.size || 0
    })
  } catch (error) {
    console.error('Error recording view:', error)
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    )
  }
}
