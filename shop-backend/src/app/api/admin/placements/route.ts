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

// GET - List all placements or view single item (for Grapsee admin)
export async function GET(req: NextRequest) {
  const admin = await verifyAdminKey(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (id) {
      const placement = await prisma.customPlacement.findUnique({
        where: { id }
      })
      if (!placement) {
        return NextResponse.json({ error: 'Placement not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, placement })
    }
    
    const placements = await prisma.customPlacement.findMany({
      orderBy: { order: 'asc' }
    })
    
    return NextResponse.json({
      success: true,
      count: placements.length,
      placements
    })
    
  } catch (error) {
    console.error('Admin fetch placements error:', error)
    return NextResponse.json({ error: 'Failed to fetch placements' }, { status: 500 })
  }
}

// POST - Create a new placement
export async function POST(req: NextRequest) {
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
    const { zone, title, content, imageUrl, linkUrl, bgColor, textColor, type, isActive, order } = body
    
    if (!zone || !title) {
      return NextResponse.json({ error: 'Zone and title are required fields' }, { status: 400 })
    }
    
    const placement = await prisma.customPlacement.create({
      data: {
        zone,
        title,
        content,
        imageUrl,
        linkUrl,
        bgColor: bgColor || 'from-violet-600 to-indigo-600',
        textColor: textColor || '#ffffff',
        type: type || 'banner',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        order: Number(order) || 0
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Placement created successfully',
      placement
    })
    
  } catch (error) {
    console.error('Admin create placement error:', error)
    return NextResponse.json({ error: 'Failed to create placement' }, { status: 500 })
  }
}

// PUT - Update a placement
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
    const { id, zone, title, content, imageUrl, linkUrl, bgColor, textColor, type, isActive, order } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Placement ID required' }, { status: 400 })
    }
    
    const updateFields: any = {}
    if (zone !== undefined) updateFields.zone = zone
    if (title !== undefined) updateFields.title = title
    if (content !== undefined) updateFields.content = content
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl
    if (linkUrl !== undefined) updateFields.linkUrl = linkUrl
    if (bgColor !== undefined) updateFields.bgColor = bgColor
    if (textColor !== undefined) updateFields.textColor = textColor
    if (type !== undefined) updateFields.type = type
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive)
    if (order !== undefined) updateFields.order = Number(order)
    
    const placement = await prisma.customPlacement.update({
      where: { id },
      data: updateFields
    })
    
    return NextResponse.json({
      success: true,
      message: 'Placement updated successfully',
      placement
    })
    
  } catch (error) {
    console.error('Admin update placement error:', error)
    return NextResponse.json({ error: 'Failed to update placement' }, { status: 500 })
  }
}

// DELETE - Delete a placement
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdminKey(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const permissions = JSON.parse(admin.permissions || '[]')
  if (!permissions.includes('delete')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }
  
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Placement ID required' }, { status: 400 })
    }
    
    await prisma.customPlacement.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Placement deleted successfully'
    })
    
  } catch (error) {
    console.error('Admin delete placement error:', error)
    return NextResponse.json({ error: 'Failed to delete placement' }, { status: 500 })
  }
}
