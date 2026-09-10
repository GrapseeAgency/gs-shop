import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Generate unique license key
function generateLicenseKey(): string {
  return `LIC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`
}

// File type detection helper
function getFileTypeFromProduct(product: any): string {
  const name = product.name.toLowerCase()
  const categoryName = product.category?.name?.toLowerCase() || ''
  
  if (name.includes('ebook') || name.includes('book') || categoryName.includes('ebook')) return 'ebook'
  if (name.includes('template') || name.includes('design') || categoryName.includes('template')) return 'template'
  if (name.includes('course') || name.includes('tutorial') || categoryName.includes('course')) return 'course'
  if (name.includes('software') || name.includes('app') || categoryName.includes('software')) return 'software'
  if (name.includes('audio') || name.includes('music') || categoryName.includes('audio')) return 'audio'
  if (name.includes('graphic') || name.includes('design') || categoryName.includes('graphic')) return 'graphic'
  return 'ebook'
}

function getFileExtensionFromProduct(fileType: string): string {
  const extensions: Record<string, string> = {
    ebook: 'PDF',
    software: 'ZIP',
    template: 'ZIP',
    course: 'MP4',
    audio: 'MP3',
    graphic: 'PSD/AI',
  }
  return extensions[fileType] || 'ZIP'
}

function getFileSizeFromIndex(index: number): string {
  const sizes = ['2.4 MB', '15.8 MB', '45.2 MB', '128 MB', '256 MB', '1.2 GB', '890 MB', '5.6 MB', '180 MB', '67 MB', '2.2 GB', '15 MB']
  return sizes[index % sizes.length]
}

// GET /api/digital-downloads List products with purchase status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const { searchParams } = new URL(request.url)
    const fileType = searchParams.get('fileType')
    const userIdParam = searchParams.get('userId')
    
    // Use authenticated user ID or fall back to param (for backwards compat)
    const effectiveUserId = userId || userIdParam

    // Find digital product categories
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        category: {
          name: {
            in: ['E-Books', 'Templates', 'Software', 'Courses', 'Digital Assets', 'Graphics', 'Audio', 'Plugins']
          }
        }
      },
      take: 24,
      orderBy: { createdAt: 'desc' },
    })

    // Get user's purchases if logged in
    let userPurchases: Record<string, any> = {}
    if (effectiveUserId) {
      const purchases = await prisma.digitalPurchase.findMany({
        where: {
          userId: effectiveUserId,
          isActive: true,
          refundedAt: null
        }
      })
      userPurchases = purchases.reduce((acc, p) => {
        acc[p.productId] = p
        return acc
      }, {} as Record<string, any>)
    }

    // Get purchase counts for display
    const purchaseCounts = await prisma.digitalPurchase.groupBy({
      by: ['productId'],
      _count: { id: true },
    })
    const countsMap = purchaseCounts.reduce((acc, item) => {
      acc[item.productId] = item._count.id
      return acc
    }, {} as Record<string, number>)

    // Transform products
    const digitalProducts = products.map((product, index) => {
      const type = getFileTypeFromProduct(product)
      const purchase = userPurchases[product.id]
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
                price: product.price,
        fileType: type,
        fileExtension: getFileExtensionFromProduct(type),
        fileSize: getFileSizeFromIndex(index),
        downloadsAllowed: 3,
        rating: product.rating || (4.2 + (index % 8) * 0.1),
        isPurchased: !!purchase,
        licenseKey: purchase?.licenseKey || null,
        downloadsRemaining: purchase?.downloadsRemaining || 0,
        purchaseDate: purchase?.createdAt || null,
      }
    })

    // Filter by file type
    let filteredProducts = digitalProducts
    if (fileType && fileType !== 'all') {
      filteredProducts = digitalProducts.filter(p => p.fileType === fileType)
    }

    // Get user's download history
    const myDownloads = effectiveUserId 
      ? await prisma.digitalPurchase.findMany({
          where: {
            userId: effectiveUserId,
            isActive: true,
            refundedAt: null
          },
          include: { product: true },
          orderBy: { lastDownloadedAt: 'desc' }
        })
      : []

    return NextResponse.json({
      products: filteredProducts,
      myDownloads: myDownloads.map(d => ({
        productId: d.productId,
        productName: d.product.name,
        downloadsRemaining: d.downloadsRemaining,
        totalDownloads: d.totalDownloads,
        lastDownloadedAt: d.lastDownloadedAt,
        licenseKey: d.licenseKey,
      })),
      total: filteredProducts.length,
      isAuthenticated: !!userId,
    })
  } catch (error) {
    console.error('[DIGITAL_DOWNLOADS_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch digital downloads' }, { status: 500 })
  }
}

// POST /api/digital-downloads Purchase or download
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to purchase or download.' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { productId, action = 'purchase', paymentMethod = 'wallet' } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Handle download action
    if (action === 'download') {
      const purchase = await prisma.digitalPurchase.findFirst({
        where: {
          userId,
          productId,
          isActive: true,
          refundedAt: null
        }
      })

      if (!purchase) {
        return NextResponse.json(
          { error: 'Purchase not found. Please purchase this product first.' },
          { status: 404 }
        )
      }

      if (purchase.downloadsRemaining <= 0) {
        return NextResponse.json(
          { error: 'Download limit reached. Contact support for assistance.' },
          { status: 403 }
        )
      }

      // Log download
      const ipAddress = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await prisma.downloadLog.create({
        data: {
          userId,
          digitalPurchaseId: purchase.id,
          ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0] : String(ipAddress),
          userAgent,
          success: true
        }
      })

      // Update counts
      const updated = await prisma.digitalPurchase.update({
        where: { id: purchase.id },
        data: {
          downloadsRemaining: { decrement: 1 },
          totalDownloads: { increment: 1 },
          lastDownloadedAt: new Date()
        }
      })

      // In production, generate a signed URL to actual file storage
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const downloadToken = generateDownloadToken(purchase.id, userId)
      
      return NextResponse.json({
        success: true,
        downloadUrl: `${baseUrl}/api/digital-downloads/file?token=${downloadToken}`,
        downloadsRemaining: updated.downloadsRemaining,
        totalDownloads: updated.totalDownloads,
        message: 'Download ready!'
      })
    }

    // Handle purchase action
    if (action === 'purchase') {
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId, isActive: true }
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found or unavailable' },
          { status: 404 }
        )
      }

      // Check if already purchased
      const existing = await prisma.digitalPurchase.findFirst({
        where: {
          userId,
          productId,
          isActive: true,
          refundedAt: null
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'You already own this product', licenseKey: existing.licenseKey },
          { status: 400 }
        )
      }

      // Handle wallet payment
      if (paymentMethod === 'wallet') {
        const wallet = await prisma.wallet.findUnique({ where: { userId } })
        
        if (!wallet || wallet.balance < product.price) {
          return NextResponse.json(
            { 
              error: 'Insufficient wallet balance',
              required: product.price,
              current: wallet?.balance || 0,
              needsTopUp: true
            },
            { status: 400 }
          )
        }

        // Deduct from wallet
        await prisma.wallet.update({
          where: { userId },
          data: { balance: { decrement: product.price } }
        })

        // Create transaction record
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'debit',
            amount: product.price,
            description: `Digital Purchase: ${product.name}`,
            referenceId: productId
          }
        })
      }
      // For Stripe, return requiresStripe flag - frontend should redirect
      else if (paymentMethod === 'stripe') {
        return NextResponse.json({
          requiresStripe: true,
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          message: 'Redirect to Stripe checkout'
        })
      }

      // Create digital purchase
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
        licenseKey: purchase.licenseKey,
        downloadsRemaining: purchase.downloadsRemaining,
        purchaseId: purchase.id,
        productName: product.name,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[DIGITAL_DOWNLOADS_POST]', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

// Helper to generate download token
function generateDownloadToken(purchaseId: string, userId: string): string {
  const timestamp = Date.now()
  const data = `${purchaseId}:${userId}:${timestamp}`
  const signature = crypto
    .createHmac('sha256', process.env.DOWNLOAD_SECRET || 'grapsee-download-secret')
    .update(data)
    .digest('hex')
  
  return Buffer.from(`${purchaseId}:${userId}:${timestamp}:${signature}`).toString('base64')
}
