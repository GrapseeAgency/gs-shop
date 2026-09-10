import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const DOWNLOAD_TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

function verifyDownloadToken(token: string): { valid: boolean; purchaseId?: string; userId?: string } {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [purchaseId, userId, timestamp, signature] = decoded.split(':')
    
    const tokenTime = parseInt(timestamp)
    if (Date.now() - tokenTime > DOWNLOAD_TOKEN_EXPIRY) {
      return { valid: false }
    }
    
    const data = `${purchaseId}:${userId}:${timestamp}`
    const expectedSignature = crypto
      .createHmac('sha256', process.env.DOWNLOAD_SECRET || 'grapsee-download-secret')
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
        userId: userId!,
        isActive: true,
        refundedAt: null
      },
      include: { product: true }
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found or expired' },
        { status: 404 }
      )
    }

    // In production, you would stream the actual file from S3 or storage
    // For demo purposes, return metadata that confirms the download is authorized
    
    const fileName = `${purchase.product.name.replace(/[^a-z0-9]/gi, '_')}.zip`
    
    return NextResponse.json({
      success: true,
      message: 'File download authorized',
      fileName,
      productName: purchase.product.name,
      licenseKey: purchase.licenseKey,
      purchaseDate: purchase.createdAt,
      downloadsRemaining: purchase.downloadsRemaining,
      // In production: return actual file stream
      downloadUrl: `https://storage.grapsee.shop/secure/${purchase.productId}/${fileName}?auth=${token}`,
      expiresAt: new Date(Date.now() + DOWNLOAD_TOKEN_EXPIRY).toISOString()
    }, {
      headers: {
        'X-Download-Authorized': 'true',
        'X-License-Key': purchase.licenseKey,
        'X-Downloads-Remaining': String(purchase.downloadsRemaining)
      }
    })
    
    /*
 // Production implementation would look like:
 
 import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
 import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
 
 const s3Client = new S3Client({ region: process.env.AWS_REGION })
 
 const command = new GetObjectCommand({
 Bucket: process.env.S3_BUCKET,
 Key: `digital-products/${purchase.productId}/files.zip`,
 })
 
 const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
 
 return Response.redirect(signedUrl)
 */
  } catch (error) {
    console.error('[DIGITAL_DOWNLOADS_FILE]', error)
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    )
  }
}
