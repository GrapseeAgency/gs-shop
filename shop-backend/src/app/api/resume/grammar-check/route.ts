import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  return NextResponse.json({
    score: null,
    suggestions: [],
    improved: text || '',
    atsScore: null,
    message: 'Grammar check requires NLP API integration',
  })
}
