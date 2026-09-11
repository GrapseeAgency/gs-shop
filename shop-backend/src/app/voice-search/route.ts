import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

// POST - Process voice search
// NOTE: This feature requires a speech-to-text API integration (Google, AWS, Azure, etc.)
// which is not yet implemented. Returns 501 Not Implemented.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio') as File

    if (!audio) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
    }

    // Feature not implemented - requires speech-to-text API integration
    return NextResponse.json({
      error: 'Voice search is not yet implemented. This feature requires integration with a speech-to-text API (Google Speech-to-Text, AWS Transcribe, or Azure Speech Services).',
      feature: 'voice-search',
      status: 'not_implemented',
      documentation: 'Contact the development team to enable this feature.'
    }, { status: 501 })
  } catch (error) {
    console.error('Voice search error:', error)
    return NextResponse.json({ error: 'Failed to process voice' }, { status: 500 })
  }
}

// GET - Get voice search history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const searches = await prisma.voiceSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({ searches })
  } catch (error) {
    console.error('Voice search history error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
