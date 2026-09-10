import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Analyze skin tone from camera/image
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const userId = req.headers.get('x-user-id')

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const matchingProducts = await prisma.product.findMany({
      where: {
        isActive: true,
      },
            take: 12
    })

    return NextResponse.json({
      success: true,
      analysis: null,
      recommendations: matchingProducts,
      message: 'Skin tone analysis requires vision API integration',
    })
  } catch (error) {
    console.error('Skin tone analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

// GET - Get user's skin tone profile
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ profile: null })

    const profile = await prisma.userBiometricProfile.findUnique({
      where: { userId }
    })

    return NextResponse.json({
      profile: profile ? JSON.parse(profile.skinTone || '{}') : null
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ profile: null })
  }
}
