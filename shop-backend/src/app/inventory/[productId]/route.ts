import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// In-memory stock reservations (productId -> reserved quantity)
const reservations = new Map<string, number>()

// Deterministic stock based on product ID hash for consistency
function hashProductId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    // Check if product exists in DB
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        comparePrice: true,
        isActive: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate stock level using deterministic hash
    const hash = hashProductId(productId)
    const stockLevel = hash % 51 // 0-50 range

    const lowStockThreshold = 10
    const isLowStock = stockLevel > 0 && stockLevel <= lowStockThreshold
    const outOfStock = stockLevel === 0

    // Get reserved quantity
    const reserved = reservations.get(productId) || 0
    const availableStock = Math.max(0, stockLevel - reserved)

    // Check for ProductVideo model and get video count
    let videoCount = 0
    try {
      const videos = await prisma.productVideo.findMany({
        where: { productId },
        select: { id: true },
      })
      videoCount = videos.length
    } catch {
      // ProductVideo model might not exist
      videoCount = 0
    }

    // Restock estimate
    const restockEstimate = outOfStock
      ? getNextRestockDate()
      : isLowStock
        ? getLowStockRestockDate()
        : null

    return NextResponse.json({
      productId,
      productName: product.name,
      stockLevel,
      availableStock,
      reserved,
      lowStockThreshold,
      isLowStock,
      outOfStock,
      videoCount,
      restockEstimate,
      lastUpdated: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const body = await request.json()
    const { quantity } = body as { quantity: number }

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      )
    }

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isActive: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      )
    }

    // Calculate current stock
    const hash = hashProductId(productId)
    const stockLevel = hash % 51
    const currentReserved = reservations.get(productId) || 0
    const availableStock = stockLevel - currentReserved

    // Check if enough stock available
    if (availableStock < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient stock',
          available: availableStock,
          requested: quantity,
        },
        { status: 409 }
      )
    }

    // Reserve the stock
    reservations.set(productId, currentReserved + quantity)

    return NextResponse.json({
      success: true,
      message: `${quantity} unit(s) reserved successfully`,
      productId,
      quantity,
      availableStock: availableStock - quantity,
      reservationId: `RES-${Date.now()}-${productId.slice(-4)}`,
    })
  } catch (error) {
    console.error('Error reserving stock:', error)
    return NextResponse.json(
      { error: 'Failed to reserve stock' },
      { status: 500 }
    )
  }
}

// Helper: Get next restock date (3-7 days from now)
function getNextRestockDate(): string {
  const days = 3 + Math.floor(Math.random() * 5)
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  return date.toISOString()
}

// Helper: Get restock date for low stock items (1-3 days)
function getLowStockRestockDate(): string {
  const days = 1 + Math.floor(Math.random() * 3)
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  return date.toISOString()
}
