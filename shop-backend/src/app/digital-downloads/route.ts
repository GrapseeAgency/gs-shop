import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// In-memory downloads tracking
const userDownloads = new Map<string, { productId: string; downloadsRemaining: number; purchasedAt: string }[]>()

// GET /api/digital-downloads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || ''
    const userId = searchParams.get('userId') || 'guest'

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(type ? { category: { slug: type } } : {}),
      },
      take: 12,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    const fileTypes = ['ebook', 'software', 'template', 'course', 'audio', 'graphic']
    const fileExtensions: Record<string, string> = {
      ebook: 'PDF',
      software: 'ZIP',
      template: 'ZIP',
      course: 'MP4',
      audio: 'MP3',
      graphic: 'PSD',
    }

    const digitalProducts = products.map((product, index) => {
      const fileType = fileTypes[index % fileTypes.length]
      const fileSizeMB = [12, 45, 8, 2500, 120, 35, 800, 5, 180, 67, 2200, 15][index % 12]

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        category: product.category?.name || 'Digital',
        price: product.price,
        fileType,
        fileExtension: fileExtensions[fileType],
        fileSize: fileSizeMB >= 1000 ? `${(fileSizeMB / 1000).toFixed(1)} GB` : `${fileSizeMB} MB`,
        fileSizeMB,
        downloadsAllowed: 3,
        rating: 4.2 + (index % 8) * 0.1,
        purchaseCount: 20 + index * 13,
        isPurchased: index < 2,
      }
    })

    const myDownloads = userDownloads.get(userId) || []

    return NextResponse.json({
      data: digitalProducts,
      myDownloads,
      total: digitalProducts.length,
    })
  } catch (error) {
    console.error('Error fetching digital downloads:', error)
    return NextResponse.json({ error: 'Failed to fetch digital downloads' }, { status: 500 })
  }
}

// POST /api/digital-downloads Purchase/download
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId = 'guest', action = 'purchase' } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    if (action === 'download') {
      const downloads = userDownloads.get(userId) || []
      const item = downloads.find(d => d.productId === productId)
      if (!item || item.downloadsRemaining <= 0) {
        return NextResponse.json({ error: 'No downloads remaining' }, { status: 400 })
      }
      item.downloadsRemaining--
      return NextResponse.json({
        success: true,
        downloadUrl: `https://cdn.grapsee.shop/downloads/${productId}`,
        downloadsRemaining: item.downloadsRemaining,
      })
    }

    // Purchase action
    const existing = userDownloads.get(userId) || []
    existing.push({
      productId,
      downloadsRemaining: 3,
      purchasedAt: new Date().toISOString(),
    })
    userDownloads.set(userId, existing)

    return NextResponse.json({
      success: true,
      message: 'Product purchased successfully!',
      downloadsRemaining: 3,
    })
  } catch (error) {
    console.error('Error processing digital download:', error)
    return NextResponse.json({ error: 'Failed to process download' }, { status: 500 })
  }
}
