import { NextRequest, NextResponse } from 'next/server'

// GET - Get gift registry
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const registryId = searchParams.get('registryId')

    if (!registryId) {
      return NextResponse.json({ error: 'Registry ID required' }, { status: 400 })
    }

    // Mock registry
    return NextResponse.json({ registry: null, items: [], contributions: [] })
  } catch (error) {
    console.error('Registry error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Create or contribute to registry
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { action } = await req.json()

    if (action === 'create' && userId) {
      const { title } = await req.json()

      const registry = {
        id: 'mock-' + Date.now(),
        title
      }

      return NextResponse.json({
        success: true,
        registry: {
          id: registry.id,
          title: registry.title,
          shareUrl: `/registry/${registry.id}`
        },
        message: 'Gift registry created! Share the link with friends and family.'
      })
    }

    if (action === 'add_item' && userId) {
      return NextResponse.json({
        success: true,
        message: 'Item added to registry'
      })
    }

    if (action === 'contribute') {
      const { amount } = await req.json()

      return NextResponse.json({
        success: true,
        contribution: { amount },
        message: 'Thank you for your contribution!',
        receipt: true
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Registry action error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
