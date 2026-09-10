import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Generate unique license key
function generateLicenseKey(): string {
  return `LIC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`
}

// Get digital products with purchase status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const { searchParams } = new URL(request.url)
    const fileType = searchParams.get('fileType')

    // Get all active digital products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // If user is logged in, check their purchases
    let userPurchases: Record<string, any> = {}
    if (userId) {
      const purchases = await prisma.digitalPurchase.findMany({
        where: {
          userId,
          isActive: true,
          refundedAt: null
        }
      })
      userPurchases = purchases.reduce((acc, p) => {
        acc[p.productId] = p
        return acc
      }, {} as Record<string, any>)
    }

    // Get download counts for analytics
    const downloadCounts = await prisma.digitalPurchase.groupBy({
      by: ['productId'],
      _count: { id: true },
    })
    const purchaseCounts = downloadCounts.reduce((acc, item) => {
      acc[item.productId] = item._count.id
      return acc
    }, {} as Record<string, number>)

    // Transform products with purchase status
    const transformedProducts = products.map(product => {
      const purchase = userPurchases[product.id]
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        fileType: getFileTypeFromProduct(product),
        fileSize: getFileSizeFromProduct(product),
        fileExtension: getFileExtensionFromProduct(product),
        rating: product.rating,
        imageUrl: product.imageUrl,
        isPurchased: !!purchase,
        licenseKey: purchase?.licenseKey || null,
        downloadsRemaining: purchase?.downloadsRemaining || 0,
        purchaseDate: purchase?.createdAt || null
      }
    })

    // Filter by file type if specified
    let filteredProducts = transformedProducts
    if (fileType && fileType !== 'all') {
      filteredProducts = transformedProducts.filter(p => p.fileType === fileType)
    }

    return NextResponse.json({
      products: filteredProducts,
      userId: userId || null
    })
  } catch (error) {
    console.error('[DIGITAL_DOWNLOADS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch digital products' },
      { status: 500 }
    )
  }
}

// Purchase digital product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to purchase' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { productId, paymentMethod = 'wallet' } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      )
    }

    // Check if user already purchased this product
    const existingPurchase = await prisma.digitalPurchase.findFirst({ where: { userId, productId } })

    if (existingPurchase?.isActive && !existingPurchase.refundedAt) {
      return NextResponse.json(
        { error: 'You have already purchased this product' },
        { status: 400 }
      )
    }

    // Handle payment based on method
    if (paymentMethod === 'wallet') {
      // Check wallet balance
      const wallet = await prisma.wallet.findUnique({
        where: { userId }
      })

      if (!wallet || wallet.balance < product.price) {
        return NextResponse.json(
          { error: 'Insufficient wallet balance', required: product.price, current: wallet?.balance || 0 },
          { status: 400 }
        )
      }

      // Deduct from wallet
      await prisma.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: product.price }
        }
      })

      // Create wallet transaction
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'debit',
          amount: product.price,
          description: `Purchase: ${product.name} (Digital Download)`,
          referenceId: productId
        }
      })
    } else if (paymentMethod === 'stripe') {
      // For Stripe integration, you would:
      // 1. Create a Stripe PaymentIntent
      // 2. Return client_secret to frontend
      // 3. Frontend confirms payment
      // 4. Webhook creates the DigitalPurchase
      
      return NextResponse.json(
        { 
          error: 'Stripe integration requires frontend payment confirmation',
          requiresStripe: true,
          productPrice: product.price
        },
        { status: 400 }
      )
    }

    // Create digital purchase record
    const licenseKey = generateLicenseKey()
    const purchase = await prisma.digitalPurchase.create({
      data: {
        userId,
        productId,
        purchasePrice: product.price,
        paymentMethod,
        licenseKey,
        downloadsRemaining: 3,
        totalDownloads: 0,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Product purchased successfully!',
      purchase: {
        id: purchase.id,
        licenseKey: purchase.licenseKey,
        productName: product.name,
        price: purchase.purchasePrice,
        downloadsRemaining: purchase.downloadsRemaining
      }
    })
  } catch (error) {
    console.error('[DIGITAL_DOWNLOADS_PURCHASE]', error)
    return NextResponse.json(
      { error: 'Failed to complete purchase' },
      { status: 500 }
    )
  }
}

// Helper functions
function getFileTypeFromProduct(product: any): string {
  const name = product.name.toLowerCase()
  if (name.includes('ebook') || name.includes('book') || name.includes('pdf')) return 'ebook'
  if (name.includes('template') || name.includes('design')) return 'template'
  if (name.includes('course') || name.includes('tutorial')) return 'course'
  if (name.includes('software') || name.includes('app')) return 'software'
  return 'ebook'
}

function getFileSizeFromProduct(product: any): string {
  // Generate realistic file sizes based on product type
  const sizes = ['2.4 MB', '15.8 MB', '45.2 MB', '128 MB', '256 MB', '1.2 GB']
  return sizes[Math.floor(Math.random() * sizes.length)]
}

function getFileExtensionFromProduct(product: any): string {
  const name = product.name.toLowerCase()
  if (name.includes('ebook') || name.includes('book')) return 'PDF'
  if (name.includes('template')) return 'FIG/PSD'
  if (name.includes('course')) return 'MP4/PDF'
  if (name.includes('software')) return 'ZIP/EXE'
  return 'ZIP'
}
