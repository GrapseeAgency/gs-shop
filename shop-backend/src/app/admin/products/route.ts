import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Middleware to verify admin API key
async function verifyAdminKey(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  
  if (!apiKey) {
    return null
  }
  
  const validKey = await prisma.adminApiKey.findUnique({
    where: { key: apiKey, isActive: true }
  })
  
  if (!validKey) {
    return null
  }

  const permissions = JSON.parse(validKey.permissions || '[]')
  if (!permissions.includes('read') && !permissions.includes('write')) {
    return null
  }
  
  // Update last used
  await prisma.adminApiKey.update({
    where: { id: validKey.id },
    data: { lastUsed: new Date() }
  })
  
  return validKey
}

// GET - List all products (for Grapsee admin)
export async function GET(req: NextRequest) {
  const admin = await verifyAdminKey(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      count: products.length,
      products
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST - Create new product (from Grapsee admin)
export async function POST(req: NextRequest) {
  const admin = await verifyAdminKey(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await req.json()
    const { name, description, price, categoryId, imageUrl, images, slug, isMock } = body
    
    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description || '',
        price: Number(price) || 0,
        imageUrl,
        images: Array.isArray(images) ? JSON.stringify(images) : images,
        categoryId,
        isActive: true,
        isMock: Boolean(isMock)
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

// PUT - Update existing product (full product control)
export async function PUT(req: NextRequest) {
  const admin = await verifyAdminKey(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const permissions = JSON.parse(admin.permissions || '[]')
  if (!permissions.includes('write')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Build update object with all possible product fields
    const updateFields: any = {}
    
    // Basic fields
    if (updateData.name !== undefined) updateFields.name = updateData.name
    if (updateData.slug !== undefined) updateFields.slug = updateData.slug
    if (updateData.description !== undefined) updateFields.description = updateData.description
    if (updateData.price !== undefined) updateFields.price = Number(updateData.price)
    if (updateData.comparePrice !== undefined) updateFields.comparePrice = updateData.comparePrice ? Number(updateData.comparePrice) : null
    if (updateData.categoryId !== undefined) updateFields.categoryId = updateData.categoryId
    
    // Media fields
    if (updateData.imageUrl !== undefined) updateFields.imageUrl = updateData.imageUrl
    if (updateData.images !== undefined) updateFields.images = Array.isArray(updateData.images) ? JSON.stringify(updateData.images) : updateData.images
    if (updateData.features !== undefined) updateFields.features = Array.isArray(updateData.features) ? JSON.stringify(updateData.features) : updateData.features
    if (updateData.techStack !== undefined) updateFields.techStack = Array.isArray(updateData.techStack) ? JSON.stringify(updateData.techStack) : updateData.techStack
    if (updateData.tags !== undefined) updateFields.tags = Array.isArray(updateData.tags) ? JSON.stringify(updateData.tags) : updateData.tags
    
    // Display flags
    if (updateData.isFeatured !== undefined) updateFields.isFeatured = Boolean(updateData.isFeatured)
    if (updateData.isActive !== undefined) updateFields.isActive = Boolean(updateData.isActive)
    if (updateData.isNew !== undefined) updateFields.isNew = Boolean(updateData.isNew)
    if (updateData.isTrending !== undefined) updateFields.isTrending = Boolean(updateData.isTrending)
    if (updateData.isFlashDeal !== undefined) updateFields.isFlashDeal = Boolean(updateData.isFlashDeal)
    if (updateData.isMock !== undefined) updateFields.isMock = Boolean(updateData.isMock)
    if (updateData.discount !== undefined) updateFields.discount = Number(updateData.discount) || 0
    
    // Delivery & Service fields
    if (updateData.deliveryTime !== undefined) updateFields.deliveryTime = updateData.deliveryTime
    if (updateData.complexity !== undefined) updateFields.complexity = updateData.complexity
    if (updateData.complexityGuide !== undefined) updateFields.complexityGuide = updateData.complexityGuide
    if (updateData.standardDeliveryDays !== undefined) updateFields.standardDeliveryDays = Number(updateData.standardDeliveryDays)
    if (updateData.rushDeliveryAvailable !== undefined) updateFields.rushDeliveryAvailable = Boolean(updateData.rushDeliveryAvailable)
    if (updateData.rushDeliveryPrice !== undefined) updateFields.rushDeliveryPrice = updateData.rushDeliveryPrice ? Number(updateData.rushDeliveryPrice) : null
    if (updateData.rushDeliveryDays !== undefined) updateFields.rushDeliveryDays = Number(updateData.rushDeliveryDays)
    if (updateData.maxMonthlyOrders !== undefined) updateFields.maxMonthlyOrders = Number(updateData.maxMonthlyOrders)
    
    // Demo & Media
    if (updateData.demoUrl !== undefined) updateFields.demoUrl = updateData.demoUrl
    if (updateData.previewImages !== undefined) updateFields.previewImages = Array.isArray(updateData.previewImages) ? JSON.stringify(updateData.previewImages) : updateData.previewImages
    if (updateData.interactiveDemoUrl !== undefined) updateFields.interactiveDemoUrl = updateData.interactiveDemoUrl
    if (updateData.videoDemoUrl !== undefined) updateFields.videoDemoUrl = updateData.videoDemoUrl
    
    // Tech Stack Options & EMI
    if (updateData.techStackOptions !== undefined) updateFields.techStackOptions = Array.isArray(updateData.techStackOptions) ? JSON.stringify(updateData.techStackOptions) : updateData.techStackOptions
    if (updateData.emiAvailable !== undefined) updateFields.emiAvailable = Boolean(updateData.emiAvailable)
    if (updateData.emiMinAmount !== undefined) updateFields.emiMinAmount = Number(updateData.emiMinAmount)
    
    // White Label
    if (updateData.whiteLabelAvailable !== undefined) updateFields.whiteLabelAvailable = Boolean(updateData.whiteLabelAvailable)
    if (updateData.whiteLabelPrice !== undefined) updateFields.whiteLabelPrice = updateData.whiteLabelPrice ? Number(updateData.whiteLabelPrice) : null

    const product = await prisma.product.update({
      where: { id },
      data: updateFields
    })

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product
    })

  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE - Delete all mock data (admin only)
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdminKey(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    // Check if admin has delete permission
    const permissions = JSON.parse(admin.permissions || '[]')
    if (!permissions.includes('delete')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const { type } = await req.json()
    
    if (type === 'mock') {
      // Delete only mock products (marked with isMock flag)
      const result = await prisma.product.deleteMany({
        where: { isMock: true }
      })
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.count} mock products`
      })
    }
    
    if (type === 'all') {
      // Delete all products (DANGEROUS - only for full reset)
      const result = await prisma.product.deleteMany({})
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.count} products`
      })
    }
    
    return NextResponse.json({ error: 'Invalid delete type' }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete products' }, { status: 500 })
  }
}
