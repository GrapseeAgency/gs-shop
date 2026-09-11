import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const featured = searchParams.get('featured')
    const userId = searchParams.get('userId') || session?.user?.id
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    const where: any = {}
    if (productId) where.productId = productId
    if (featured === 'true') where.isFeatured = true
    if (userId) where.userId = userId

    const [photos, total] = await Promise.all([
      prisma.customerPhoto.findMany({
        where,
        include: {
          product: {
            select: { 
              name: true, 
              price: true, 
              imageUrl: true, 
              slug: true,
              isActive: true 
            }
          },
          user: {
            select: { name: true } // avatar doesn't exist in User schema
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.customerPhoto.count({ where })
    ])

    // Filter out photos for inactive products
    const validPhotos = photos.filter(photo => 
      !photo.product || photo.product.isActive
    )

    const formattedPhotos = validPhotos.map(photo => ({
      id: photo.id,
      productId: photo.productId,
      userId: photo.userId,
      userName: photo.userName || 'Anonymous',
      userImage: null, // avatar doesn't exist in User schema
      imageUrl: photo.imageUrl,
      caption: photo.caption,
      likes: photo.likes,
      isFeatured: photo.isFeatured,
      isApproved: true, // Default to true since isApproved doesn't exist in schema
      createdAt: photo.createdAt,
      updatedAt: photo.createdAt,
      product: photo.product,
      timeAgo: getTimeAgo(photo.createdAt)
    }))

    // Get statistics
    const totalLikes = formattedPhotos.reduce((sum, photo) => sum + photo.likes, 0)
    const featuredCount = formattedPhotos.filter(photo => photo.isFeatured).length
    const approvedCount = formattedPhotos.filter(photo => photo.isApproved).length

    return NextResponse.json({
      success: true,
      data: {
        photos: formattedPhotos,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total
        },
        summary: {
          totalPhotos: total,
          totalLikes,
          featuredPhotos: featuredCount,
          approvedPhotos: approvedCount,
          averageLikes: formattedPhotos.length > 0 ? Math.round(totalLikes / formattedPhotos.length) : 0
        }
      }
    })
  } catch (error) {
    console.error('Customer photos fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer photos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, userName, imageUrl, caption } = body

    if (!productId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'productId and imageUrl are required' },
        { status: 400 }
      )
    }

    // Validate product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, isActive: true }
    })

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({ success: false, error: 'Product is not active' }, { status: 400 })
    }

    // Check if user already uploaded a photo for this product
    const existingPhoto = await prisma.customerPhoto.findFirst({
      where: {
        productId,
        userId: session.user.id
      }
    })

    if (existingPhoto) {
      return NextResponse.json({ 
        success: false, 
        error: 'You have already uploaded a photo for this product' 
      }, { status: 409 })
    }

    const photo = await prisma.customerPhoto.create({
      data: {
        productId,
        userId: session.user.id,
        userName: userName || session.user.name || 'Customer',
        imageUrl,
        caption: caption || null,
        likes: 0,
        isFeatured: false,
      },
      include: {
        product: {
          select: { name: true, price: true, imageUrl: true, slug: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        photo: {
          ...photo,
          timeAgo: getTimeAgo(photo.createdAt)
        }
      },
      message: 'Photo uploaded successfully! It will appear after review.'
    }, { status: 201 })
  } catch (error) {
    console.error('Customer photo upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}

// PUT /api/customer-photos Like or update photo
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { photoId, action, isFeatured, isApproved } = body

    if (!photoId) {
      return NextResponse.json({ success: false, error: 'Photo ID is required' }, { status: 400 })
    }

    const photo = await prisma.customerPhoto.findUnique({
      where: { id: photoId },
      include: {
        product: {
          select: { name: true, price: true, imageUrl: true, slug: true }
        }
      }
    })

    if (!photo) {
      return NextResponse.json({ success: false, error: 'Photo not found' }, { status: 404 })
    }

    if (action === 'like') {
      const userId = request.headers.get('x-user-id') || 'anonymous'

      // Check if already liked (findFirst since no composite unique)
      const existingLike = await prisma.photoLike.findFirst({
        where: { photoId, userId }
      })

      if (existingLike) {
        // Unlike
        await prisma.photoLike.delete({ where: { id: existingLike.id } })
        const newLikes = Math.max(0, (photo.likes || 0) - 1)
        await prisma.customerPhoto.update({
          where: { id: photoId },
          data: { likes: newLikes }
        })
        return NextResponse.json({
          success: true,
          data: { liked: false, likes: newLikes },
          message: 'Photo unliked'
        })
      }

      // Like
      await prisma.photoLike.create({
        data: { photoId, userId }
      })
      const newLikes = (photo.likes || 0) + 1
      await prisma.customerPhoto.update({
        where: { id: photoId },
        data: { likes: newLikes }
      })

      return NextResponse.json({
        success: true,
        data: { liked: true, likes: newLikes },
        message: 'Photo liked'
      })
    } else {
      // Admin actions (featured, approval)
      const updateData: any = {}
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured
      if (isApproved !== undefined) updateData.isApproved = isApproved

      const updatedPhoto = await prisma.customerPhoto.update({
        where: { id: photoId },
        data: updateData,
        include: {
          product: {
            select: { name: true, price: true, imageUrl: true, slug: true }
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          photo: {
            ...updatedPhoto,
            timeAgo: getTimeAgo(updatedPhoto.createdAt)
          }
        },
        message: `Photo ${isApproved ? 'approved' : 'updated'} successfully`
      })
    }
  } catch (error) {
    console.error('Customer photo update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update photo' }, { status: 500 })
  }
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - new Date(date).getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    return diffInMinutes > 0 ? `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago` : 'Just now'
  }
}
