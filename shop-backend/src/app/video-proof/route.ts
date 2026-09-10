import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Upload video proof of delivery
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const orderId = formData.get('orderId') as string
    const video = formData.get('video') as File
    const location = formData.get('location') as string

    if (!orderId || !video) {
      return NextResponse.json({ error: 'Order ID and video required' }, { status: 400 })
    }

    // In real implementation, upload to cloud storage (S3, Cloudinary, etc.)
        const videoUrl = `https://storage.grapsee.shop/delivery-proofs/${orderId}/${Date.now()}.mp4`

    // Store proof record
    const proof = await prisma.deliveryProof.create({
      data: {
        orderId,
        videoUrl,
        location: location ? JSON.parse(location) : null,
        recordedAt: new Date()
      }
    })

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        hasDeliveryVideo: true,
        status: 'delivered'
      }
    })

    return NextResponse.json({
      success: true,
      proof,
      message: 'Delivery video proof uploaded successfully'
    })
  } catch (error) {
    console.error('Video proof error:', error)
    return NextResponse.json({ error: 'Failed to upload proof' }, { status: 500 })
  }
}

// GET - Get delivery video for order
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const proof = await prisma.deliveryProof.findFirst({
      where: { orderId },
      orderBy: { recordedAt: 'desc' }
    })

    if (!proof) {
      return NextResponse.json({
        exists: false,
        message: 'No delivery video available for this order'
      })
    }

    return NextResponse.json({
      exists: true,
      proof: {
        videoUrl: proof.videoUrl,
        recordedAt: proof.recordedAt,
        location: proof.location,
        duration: proof.duration
      }
    })
  } catch (error) {
    console.error('Fetch proof error:', error)
    return NextResponse.json({ error: 'Failed to fetch proof' }, { status: 500 })
  }
}
