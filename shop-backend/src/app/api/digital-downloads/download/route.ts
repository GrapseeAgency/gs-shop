import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Download token expiration (1 hour)
const DOWNLOAD_TOKEN_EXPIRY = 60 * 60 * 1000

// Generate signed download URL
function generateDownloadToken(purchaseId: string, userId: string): string {
  const timestamp = Date.now()
  const data = `${purchaseId}:${userId}:${timestamp}`
  const signature = crypto
    .createHmac('sha256', process.env.DOWNLOAD_SECRET || 'fallback-secret')
    .update(data)
    .digest('hex')
  
  return Buffer.from(`${purchaseId}:${userId}:${timestamp}:${signature}`).toString('base64')
}

// Verify download token
function verifyDownloadToken(token: string): { valid: boolean; purchaseId?: string; userId?: string } {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [purchaseId, userId, timestamp, signature] = decoded.split(':')
    
    // Check expiration
    const tokenTime = parseInt(timestamp)
    if (Date.now() - tokenTime > DOWNLOAD_TOKEN_EXPIRY) {
      return { valid: false }
    }
    
    // Verify signature
    const data = `${purchaseId}:${userId}:${timestamp}`
    const expectedSignature = crypto
      .createHmac('sha256', process.env.DOWNLOAD_SECRET || 'fallback-secret')
      .update(data)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      return { valid: false }
    }
    
    return { valid: true, purchaseId, userId }
  } catch {
    return { valid: false }
  }
}

// Request download URL (authenticated)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Find the digital purchase
    const purchase = await prisma.digitalPurchase.findFirst({
      where: {
        userId,
        productId,
        // Note: isActive doesn't exist in DigitalPurchase schema
        refundedAt: null
      },
      include: {
        product: true
      }
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found. Please purchase this product first.' },
        { status: 404 }
      )
    }

    // Check download limit
    if (purchase.downloadsRemaining <= 0) {
      return NextResponse.json(
        { error: 'Download limit reached. Contact support for assistance.' },
        { status: 403 }
      )
    }

    // Generate secure download token
    const downloadToken = generateDownloadToken(purchase.id, userId)
    
    // Log download attempt
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    await prisma.downloadLog.create({
      data: {
        userId,
        digitalPurchaseId: purchase.id,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0] : ipAddress,
        userAgent,
        success: true
      }
    })

    // Update download counts
    await prisma.digitalPurchase.update({
      where: { id: purchase.id },
      data: {
        downloadsRemaining: { decrement: 1 },
        totalDownloads: { increment: 1 },
        lastDownloadedAt: new Date()
      }
    })

    // Generate secure download URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const downloadUrl = `${baseUrl}/api/digital-downloads/file?token=${encodeURIComponent(downloadToken)}`

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: `${purchase.product.name.replace(/[^a-z0-9]/gi, '_')}.zip`,
      downloadsRemaining: purchase.downloadsRemaining - 1,
      totalDownloads: purchase.totalDownloads + 1,
      expiresAt: new Date(Date.now() + DOWNLOAD_TOKEN_EXPIRY).toISOString()
    })
  } catch (error) {
    console.error('[DIGITAL_DOWNLOADS_REQUEST]', error)
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    )
  }
}

// GET handler for file download (uses token)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Download token required' },
        { status: 400 }
      )
    }

    // Verify token
    const verification = verifyDownloadToken(token)
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Invalid or expired download token' },
        { status: 403 }
      )
    }

    const { purchaseId, userId } = verification

    // Verify purchase exists and is valid
    const purchase = await prisma.digitalPurchase.findFirst({
      where: {
        id: purchaseId,
        userId: userId,
        // Note: isActive doesn't exist in DigitalPurchase schema
        refundedAt: null
      },
      include: {
        product: true
      }
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found or expired' },
        { status: 404 }
      )
    }

    // In a real implementation, you would:
    // 1. Stream the file from storage (S3, etc.)
    // 2. Set appropriate headers for file download
    // For this demo, we'll return a placeholder response

    const fileName = `${purchase.product.name.replace(/[^a-z0-9]/gi, '_')}.zip`
    
    // Return success with file metadata
    // In production, stream actual file bytes here
    return NextResponse.json({
      success: true,
      message: 'File download authorized',
      fileName,
      productName: purchase.product.name,
      licenseKey: purchase.licenseKey,
      // In production: return new Response(fileStream, { headers: {...} })
    }, {
      headers: {
        'X-Download-Authorized': 'true',
        'X-License-Key': purchase.licenseKey
      }
    })
  } catch (error) {
    console.error('[DIGITAL_DOWNLOADS_FILE]', error)
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    )
  }
}
