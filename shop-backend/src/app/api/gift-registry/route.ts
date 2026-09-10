import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const occasion = searchParams.get('occasion')
    const createdBy = searchParams.get('createdBy')
    const userId = searchParams.get('userId') || session?.user?.id
    const isPublic = searchParams.get('public')
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    // Build where clause
    const whereClause: any = {}
    if (occasion) whereClause.occasion = occasion
    if (createdBy) whereClause.createdBy = createdBy
    if (userId) whereClause.createdBy = userId
    if (isPublic === 'true') whereClause.isPublic = true
    if (isPublic === 'false') whereClause.isPublic = false

    const [registries, total] = await Promise.all([
      prisma.giftRegistry.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.giftRegistry.count({ where: whereClause })
    ])

    const result = registries.map((registry) => {
      const productIds = typeof registry.productIds === 'string' 
        ? JSON.parse(registry.productIds) 
        : registry.productIds || []

      return {
        ...registry,
        productIds,
        itemCount: productIds.length,
        daysUntilEvent: registry.eventDate
          ? Math.max(0, Math.ceil((new Date(registry.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null,
        isPastEvent: registry.eventDate ? new Date(registry.eventDate) < new Date() : false,
        occasionLabel: registry.occasion.charAt(0).toUpperCase() + registry.occasion.slice(1)
      }
    })

    return NextResponse.json({ 
      success: true,
      data: result,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      },
      summary: {
        totalRegistries: total,
        publicRegistries: registries.filter(r => r.isPublic).length,
        privateRegistries: registries.filter(r => !r.isPublic).length
      }
    })
  } catch (error) {
    console.error('Gift registry list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gift registries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { title, description, occasion, productIds, createdBy, isPublic, eventDate, userId } = body

    const targetUserId = userId || session?.user?.id || createdBy

    if (!title || !occasion || !targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Title, occasion, and user identification are required' },
        { status: 400 }
      )
    }

    const validOccasions = ['wedding', 'birthday', 'baby', 'housewarming', 'graduation', 'anniversary', 'holiday']
    if (!validOccasions.includes(occasion)) {
      return NextResponse.json(
        { success: false, error: `Invalid occasion. Must be one of: ${validOccasions.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate product IDs if provided
    if (productIds && Array.isArray(productIds)) {
      const validProducts = await prisma.product.findMany({
        where: { 
          id: { in: productIds },
          isActive: true 
        },
        select: { id: true }
      })
      
      if (validProducts.length !== productIds.length) {
        return NextResponse.json(
          { success: false, error: 'Some products are invalid or not available' },
          { status: 400 }
        )
      }
    }

    // Validate event date if provided
    if (eventDate) {
      const eventDateObj = new Date(eventDate)
      if (eventDateObj <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'Event date must be in the future' },
          { status: 400 }
        )
      }
    }

    const registry = await prisma.giftRegistry.create({
      data: {
        title,
        description: description || null,
        occasion,
        productIds: JSON.stringify(productIds || []),
        createdBy: targetUserId,
        isPublic: isPublic !== false,
        eventDate: eventDate ? new Date(eventDate) : null,
      },
    })

    const parsedProductIds = JSON.parse(registry.productIds)

    return NextResponse.json({
      success: true,
      data: {
        ...registry,
        productIds: parsedProductIds,
        itemCount: parsedProductIds.length,
        daysUntilEvent: registry.eventDate
          ? Math.max(0, Math.ceil((new Date(registry.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null,
        occasionLabel: registry.occasion.charAt(0).toUpperCase() + registry.occasion.slice(1),
        message: 'Gift registry created successfully'
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Gift registry create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create gift registry' },
      { status: 500 }
    )
  }
}

// PUT - Update gift registry
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { registryId, title, description, occasion, productIds, isPublic, eventDate } = body

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    if (!registryId) {
      return NextResponse.json({ success: false, error: 'Registry ID is required' }, { status: 400 })
    }

    const existingRegistry = await prisma.giftRegistry.findUnique({
      where: { id: registryId }
    })

    if (!existingRegistry) {
      return NextResponse.json({ success: false, error: 'Registry not found' }, { status: 404 })
    }

    if (existingRegistry.createdBy !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (occasion !== undefined) {
      const validOccasions = ['wedding', 'birthday', 'baby', 'housewarming', 'graduation', 'anniversary', 'holiday']
      if (!validOccasions.includes(occasion)) {
        return NextResponse.json({ success: false, error: `Invalid occasion. Must be one of: ${validOccasions.join(', ')}` }, { status: 400 })
      }
      updateData.occasion = occasion
    }
    if (productIds !== undefined) {
      if (Array.isArray(productIds)) {
        const validProducts = await prisma.product.findMany({
          where: { 
            id: { in: productIds },
            isActive: true 
          },
          select: { id: true }
        })
        
        if (validProducts.length !== productIds.length) {
          return NextResponse.json({ success: false, error: 'Some products are invalid or not available' }, { status: 400 })
        }
      }
      updateData.productIds = JSON.stringify(productIds || [])
    }
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (eventDate !== undefined) {
      const eventDateObj = new Date(eventDate)
      if (eventDateObj <= new Date()) {
        return NextResponse.json({ success: false, error: 'Event date must be in the future' }, { status: 400 })
      }
      updateData.eventDate = eventDateObj
    }

    const updatedRegistry = await prisma.giftRegistry.update({
      where: { id: registryId },
      data: updateData
    })

    const parsedProductIds = JSON.parse(updatedRegistry.productIds)

    return NextResponse.json({
      success: true,
      data: {
        ...updatedRegistry,
        productIds: parsedProductIds,
        itemCount: parsedProductIds.length,
        daysUntilEvent: updatedRegistry.eventDate
          ? Math.max(0, Math.ceil((new Date(updatedRegistry.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null,
        occasionLabel: updatedRegistry.occasion.charAt(0).toUpperCase() + updatedRegistry.occasion.slice(1),
        message: 'Gift registry updated successfully'
      }
    })
  } catch (error) {
    console.error('Gift registry update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update gift registry' }, { status: 500 })
  }
}

// DELETE - Delete gift registry
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const registryId = searchParams.get('registryId')

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    if (!registryId) {
      return NextResponse.json({ success: false, error: 'Registry ID is required' }, { status: 400 })
    }

    const existingRegistry = await prisma.giftRegistry.findUnique({
      where: { id: registryId }
    })

    if (!existingRegistry) {
      return NextResponse.json({ success: false, error: 'Registry not found' }, { status: 404 })
    }

    if (existingRegistry.createdBy !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    await prisma.giftRegistry.delete({
      where: { id: registryId }
    })

    return NextResponse.json({
      success: true,
      message: 'Gift registry deleted successfully'
    })
  } catch (error) {
    console.error('Gift registry delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete gift registry' }, { status: 500 })
  }
}
