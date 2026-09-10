import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Scan QR code to verify authenticity
export async function POST(req: NextRequest) {
  try {
    const { qrCode, serialNumber } = await req.json()

    // Find product by QR or serial
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { qrCode: qrCode || '' },
          { serialNumber: serialNumber || '' }
        ]
      },
      include: {
        seller: { select: { name: true, isVerified: true } },
        nFTCertificates: true
      }
    })

    if (!product) {
      return NextResponse.json({
        verified: false,
        warning: 'Product not found in database. This may be counterfeit.',
        risk: 'high'
      }, { status: 404 })
    }

    // Check if has NFT certificate
    const hasCertificate = product.nFTCertificates && product.nFTCertificates.length > 0

    // Verify authenticity score
    let score = 50 // Base score
    if (product.seller?.isVerified) score += 20
    if (hasCertificate) score += 30
    if (product.isAuthentic) score += 50

    return NextResponse.json({
      verified: score >= 80,
      score,
      product: {
        id: product.id,
        name: product.name,
        seller: product.seller,
        hasNFTCertificate: hasCertificate,
        authenticityVerified: product.isAuthentic || false
      },
      details: {
        manufacturingDate: product.manufacturedAt,
        batchNumber: product.batchNumber,
        origin: product.origin,
        sellerVerification: product.seller?.isVerified ? 'Verified' : 'Unverified'
      },
      message: score >= 80 
        ? ' Authentic product verified' 
        : score >= 50 
        ? ' Verification incomplete - contact seller'
        : ' High risk - potential counterfeit'
    })
  } catch (error) {
    console.error('Authenticity check error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

// GET - Generate QR code for product (admin/seller)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Generate unique QR code
    const qrCode = `GRAPSEE-AUTH-${productId}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    // Update product
    await prisma.product.update({
      where: { id: productId },
      data: { qrCode }
    })

    return NextResponse.json({
      success: true,
      qrCode,
      verifyUrl: `/verify?code=${qrCode}`,
      message: 'QR code generated for authenticity verification'
    })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 })
  }
}
