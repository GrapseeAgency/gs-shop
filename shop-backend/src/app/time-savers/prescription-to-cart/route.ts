import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Convert prescription photo to medicine cart
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const userId = req.headers.get('x-user-id')

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

        // Find medicines and generics
    const cartItems = []
    for (const med of []) {
      // Find branded medicine
      const branded = await prisma.product.findFirst({
        where: {
          isActive: true,
          OR: [
            { name: { contains: med.name } },
            { tags: { contains: med.name.toLowerCase() } }
          ],
          category: { name: { contains: 'medicine' } }
        }
      })

      // Find generic alternative
      const generic = await prisma.product.findFirst({
        where: {
          isActive: true,
          tags: { contains: 'generic' },
          OR: [
            { name: { contains: med.name } },
            { description: { contains: med.name } }
          ]
        },
        orderBy: { price: 'asc' }
      })

      if (branded || generic) {
        const brandedPrice = branded?.price || 0
        const genericPrice = generic?.price || 0
        const savings = brandedPrice - genericPrice

        cartItems.push({
          prescribed: med,
          branded: branded ? {
            id: branded.id,
            name: branded.name,
            price: brandedPrice
          } : null,
          generic: generic ? {
            id: generic.id,
            name: generic.name,
            price: genericPrice,
            savings: savings > 0 ? savings : 0,
            savingsPercent: brandedPrice > 0 ? Math.round((savings / brandedPrice) * 100) : 0
          } : null,
          recommendation: generic && savings > 0 ? 'generic' : 'branded'
        })
      }
    }

    const totalBranded = cartItems.reduce((sum, item) => sum + (item.branded?.price || 0), 0)
    const totalGeneric = cartItems.reduce((sum, item) => sum + (item.generic?.price || 0), 0)

    return NextResponse.json({
      success: true,
      medicines: cartItems,
      totals: {
        branded: totalBranded,
        generic: totalGeneric,
        savings: totalBranded - totalGeneric,
        savingsPercent: totalBranded > 0 ? Math.round(((totalBranded - totalGeneric) / totalBranded) * 100) : 0
      },
      message: `Found ${cartItems.length} medicines! Generic alternatives can save ${Math.round(((totalBranded - totalGeneric) / totalBranded) * 100)}%.`,
      warning: 'Always consult your doctor before switching to generic medicines.',
      checkoutUrl: '/checkout?prescription=true'
    })
  } catch (error) {
    console.error('Prescription to cart error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
