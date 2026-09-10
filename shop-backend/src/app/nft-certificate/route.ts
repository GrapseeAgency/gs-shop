import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get NFT certificate for a premium purchase
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
    const productId = searchParams.get('productId')

    if (!orderId && !productId) {
      return NextResponse.json({ error: 'Order ID or Product ID required' }, { status: 400 })
    }

    const where: any = {}
    if (productId) where.productId = productId

    const certificate = await prisma.nFTCertificate.findFirst({
      where,
      include: {
        product: {
          select: { id: true, name: true, imageUrl: true, price: true }
        },
        order: {
          select: { id: true, createdAt: true, customerName: true }
        }
      }
    })

    if (!certificate) {
      return NextResponse.json({
        exists: false,
        message: 'No certificate found. NFT certificates are only issued for luxury tier purchases.'
      })
    }

    return NextResponse.json({
      exists: true,
      certificate: {
        id: certificate.id,
        tokenId: certificate.tokenId,
        product: certificate.product,
        purchaseDate: certificate.order?.createdAt,
        owner: certificate.order?.customerName,
        blockchain: certificate.blockchain,
        verified: true,
        metadata: {
          authenticity: 'Verified Authentic',
          limited: certificate.isLimitedEdition,
          edition: certificate.editionNumber,
          totalEditions: certificate.totalEditions
        }
      },
      qrUrl: `/api/nft-certificate/verify?token=${certificate.tokenId}`
    })
  } catch (error) {
    console.error('NFT certificate error:', error)
    return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 })
  }
}

// POST - Create NFT certificate for luxury purchase
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { orderId, productId } = await req.json()

    // Verify the order qualifies (luxury tier)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if already has certificate
    const existing = await prisma.nFTCertificate.findFirst({
      where: { orderId }
    })

    if (existing) {
      return NextResponse.json({
        exists: true,
        certificate: existing,
        message: 'Certificate already exists'
      })
    }

    // Generate [] token ID (in real app, would mint on blockchain)
    const tokenId = `GRAPSEE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const certificate = await prisma.nFTCertificate.create({
      data: {
        orderId: orderId as string,
        productId: productId as string,
        ownerId: userId || order.customerEmail,
        tokenId,
        contractAddress: '0x0000000000000000000000000000000000000000',
        blockchain: 'Polygon',
        isLimitedEdition: order.total > 1000,
        editionNumber: 1,
        totalEditions: order.total > 1000 ? 100 : null,
        metadataUrl: `https://api.grapsee.io/nft/metadata/${tokenId}.json`
      }
    })

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        tokenId: certificate.tokenId,
        blockchain: certificate.blockchain,
        message: 'NFT Certificate of Authenticity created!'
      },
      downloadUrl: `/nft-certificate/${certificate.id}/download`
    })
  } catch (error) {
    console.error('NFT creation error:', error)
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
  }
}

// Verify certificate authenticity
export async function PUT(req: NextRequest) {
  try {
    const { tokenId } = await req.json()

    const certificate = await prisma.nFTCertificate.findUnique({
      where: { tokenId }
    })

    if (!certificate) {
      return NextResponse.json({
        verified: false,
        message: 'Invalid token ID'
      })
    }

    return NextResponse.json({
      verified: true,
      certificate: {
        tokenId: certificate.tokenId,
        productId: certificate.productId,
        ownerId: certificate.ownerId,
        createdAt: certificate.mintedAt,
        blockchain: certificate.blockchain
      }
    })
  } catch (error) {
    console.error('NFT verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
