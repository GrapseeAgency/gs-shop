import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store for active viewers (shared with view route)
const activeViewers = new Map<string, Set<string>>()

// GET /api/products/[id]/viewers - Get current viewer count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const count = activeViewers.get(id)?.size || 0
    
    return NextResponse.json({ 
      count,
      productId: id
    })
  } catch (error) {
    console.error('Error getting viewers:', error)
    return NextResponse.json(
      { error: 'Failed to get viewer count' },
      { status: 500 }
    )
  }
}
