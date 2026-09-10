import { NextRequest, NextResponse } from 'next/server'

// POST - Scan and track medicine expiry
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Image received for processing',
      medicines: [],
    })
  } catch (error) {
    console.error('Medicine expiry error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get all tracked medicines
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      medicines: [],
      total: 0,
      expiringSoon: 0,
      expired: 0,
      alerts: [],
    })
  } catch (error) {
    console.error('Medicine tracker error:', error)
    return NextResponse.json({ medicines: [] })
  }
}
