import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  
    const suggestions = [
    { type: 'grammar', message: 'Consider using "managed" instead of "handled"', position: 45 },
    { type: 'style', message: 'Add specific metrics to quantify achievements', position: 120 },
    { type: 'keyword', message: 'Include keywords from job description', position: 0 },
  ]
  
  const score = Math.min(100, 70 + Math.floor(Math.random() * 25))
  
  return NextResponse.json({
    score,
    suggestions,
    improved: text,
    atsScore: Math.floor(Math.random() * 20) + 80
  })
}
