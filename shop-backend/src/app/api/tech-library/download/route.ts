import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

// Resource catalog
const resources: Record<string, { name: string }> = {}

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
    const { resourceId, pointsCost } = body

    const resource = resources[resourceId as keyof typeof resources]
    
    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Get user's rewards points (stored in User model)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rewardsPoints: true }
    })

    if (!user || user.rewardsPoints < pointsCost) {
      return NextResponse.json(
        { 
          error: 'Insufficient points',
          required: pointsCost,
          current: user?.rewardsPoints || 0
        },
        { status: 400 }
      )
    }

    // Deduct points from user
    await prisma.user.update({
      where: { id: userId },
      data: { rewardsPoints: { decrement: pointsCost } }
    })

    // Record the download using DigitalDownload model
    const download = await prisma.digitalDownload.create({
      data: {
        productId: resourceId,
        productName: resource.name,
        fileType: 'resource',
        downloadUrl: `/api/tech-library/file/${resourceId}`,
        downloadCount: 1,
        maxDownloads: 5,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      downloadId: download.id,
      resourceId,
      resourceName: resource.name,
      pointsDeducted: pointsCost,
      newBalance: user.rewardsPoints - pointsCost,
      downloadUrl: download.downloadUrl,
      message: `Successfully downloaded ${resource.name}`
    })

  } catch (error) {
    console.error('[TECH_LIBRARY_DOWNLOAD]', error)
    return NextResponse.json(
      { error: 'Failed to download resource' },
      { status: 500 }
    )
  }
}
