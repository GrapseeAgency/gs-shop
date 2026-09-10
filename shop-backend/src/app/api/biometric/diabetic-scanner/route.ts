import { NextRequest, NextResponse } from 'next/server'

// POST - Scan food for diabetic safety
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    return NextResponse.json({
      food: null,
      diabeticRating: null,
      message: 'Food analysis requires vision API integration',
    })
  } catch (error) {
    console.error('Diabetic scanner error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
