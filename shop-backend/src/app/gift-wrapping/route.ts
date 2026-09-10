import { NextRequest, NextResponse } from 'next/server'

const WRAPPING_DESIGNS = [
  { id: 'classic', name: 'Classic', description: 'Timeless elegant wrapping in gold & white', price: 4.99, image: '', colors: ['Gold', 'White', 'Silver'] },
  { id: 'birthday', name: 'Birthday', description: 'Fun & festive with balloons and confetti', price: 5.99, image: '', colors: ['Pink', 'Blue', 'Rainbow'] },
  { id: 'wedding', name: 'Wedding', description: 'Sophisticated ivory with satin ribbon', price: 8.99, image: '', colors: ['Ivory', 'Champagne', 'Rose Gold'] },
  { id: 'holiday', name: 'Holiday', description: 'Seasonal cheer with snowflakes & stars', price: 5.99, image: '', colors: ['Red', 'Green', 'Gold'] },
  { id: 'premium', name: 'Premium', description: 'Luxury matte black with foil accents', price: 12.99, image: '', colors: ['Black', 'Navy', 'Burgundy'] },
  { id: 'custom', name: 'Custom', description: 'Design your own wrapping with custom text', price: 14.99, image: '', colors: ['Your Choice'] },
]

const RIBBON_COLORS = [
  { id: 'red', name: 'Red', hex: '#EF4444' },
  { id: 'gold', name: 'Gold', hex: '#EAB308' },
  { id: 'silver', name: 'Silver', hex: '#9CA3AF' },
  { id: 'navy', name: 'Navy', hex: '#1E3A5F' },
  { id: 'pink', name: 'Pink', hex: '#EC4899' },
  { id: 'emerald', name: 'Emerald', hex: '#10B981' },
  { id: 'purple', name: 'Purple', hex: '#8B5CF6' },
  { id: 'white', name: 'White', hex: '#F9FAFB' },
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      designs: WRAPPING_DESIGNS,
      ribbonColors: RIBBON_COLORS,
      maxMessageLength: 200,
    })
  } catch (error) {
    console.error('[GIFT-WRAPPING] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load wrapping options' }, { status: 500 })
  }
}
