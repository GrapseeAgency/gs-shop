import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get product care instructions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const userId = req.headers.get('x-user-id')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Generate care instructions based on category
    const careInstructions = generateCareInstructions(product)

    // Check if user owns this product
    let owned = false
    let purchaseDate = null
    if (userId) {
      const order = await prisma.order.findFirst({
        where: {
          customerEmail: userId,
          items: {
            some: { productId }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      if (order) {
        owned = true
        purchaseDate = order.createdAt
      }
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl
      },
      careInstructions,
      owned,
      purchaseDate,
      warranty: product.warrantyMonths ? `${product.warrantyMonths} months` : 'Check with seller',
      maintenanceSchedule: generateMaintenanceSchedule(product, careInstructions)
    })
  } catch (error) {
    console.error('Product care error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function generateCareInstructions(product: any) {
  const category = product.category?.name?.toLowerCase() || ''
  const instructions: Record<string, any> = {
    electronics: {
      cleaning: ['Use microfiber cloth', 'Avoid harsh chemicals', 'Unplug before cleaning'],
      storage: ['Keep in dry place', 'Avoid extreme temperatures'],
      warnings: ['Do not disassemble', 'Keep away from water'],
      frequency: 'Weekly dusting'
    },
    clothing: {
      washing: product.washInstructions ? [product.washInstructions] : ['Machine wash cold', 'Tumble dry low'],
      ironing: product.ironingInstructions ? [product.ironingInstructions] : ['Iron on medium heat if needed'],
      storage: ['Hang or fold neatly', 'Store in cool, dry place'],
      frequency: 'After each wear'
    },
    furniture: {
      cleaning: ['Dust regularly', 'Use appropriate polish', 'Clean spills immediately'],
      maintenance: ['Tighten screws periodically', 'Check for wear'],
      frequency: 'Monthly deep clean'
    },
    shoes: {
      cleaning: ['Brush off dirt', 'Use appropriate cleaner for material', 'Air dry naturally'],
      storage: ['Use shoe trees', 'Store in breathable bags'],
      rotation: 'Rotate pairs to extend life',
      frequency: 'After each use'
    }
  }

  // Find matching category or return default
  for (const [key, value] of Object.entries(instructions)) {
    if (category.includes(key)) return value
  }

  return {
    cleaning: ['Follow manufacturer instructions', 'Handle with care'],
    storage: ['Store appropriately for the product type'],
    frequency: 'As needed'
  }
}

function generateMaintenanceSchedule(product: any, instructions: any) {
  const schedule = []
  
  if (instructions.cleaning) {
    schedule.push({
      task: 'Regular Cleaning',
      frequency: instructions.frequency,
      nextDue: 'As per usage'
    })
  }

  if (product.warrantyMonths) {
    schedule.push({
      task: 'Warranty Check',
      frequency: `Valid for ${product.warrantyMonths} months`,
      nextDue: 'Contact seller if issues arise'
    })
  }

  return schedule
}
