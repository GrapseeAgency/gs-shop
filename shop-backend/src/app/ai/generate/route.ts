import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { type, input } = await req.json()
  
  return NextResponse.json({
    results: [],
    creditsUsed: 1,
    remainingCredits: 9
  })
}
