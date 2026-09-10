import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    credits: 10,
    used: 0,
    remaining: 10,
    plan: 'free'
  })
}

export async function POST(req: NextRequest) {
  const { action } = await req.json()
  
  if (action === 'purchase') {
    return NextResponse.json({
      credits: 100,
      price: 499,
      message: '100 AI credits purchased successfully'
    })
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
