import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Admin API Authentication via API Keys
// This allows Grapsee.com to control the shop remotely

export async function POST(req: NextRequest) {
  try {
    const { apiKey, action } = await req.json()
    
    // Validate API Key
    const validKey = await prisma.adminApiKey.findUnique({
      where: { key: apiKey, isActive: true }
    })
    
    if (!validKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }
    
    // Update last used
    await prisma.adminApiKey.update({
      where: { id: validKey.id },
      data: { lastUsed: new Date() }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin API authenticated',
      permissions: validKey.permissions
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

// Generate new API Key for Grapsee Admin
export async function PUT(req: NextRequest) {
  try {
    const { name, permissions } = await req.json()
    
    // Generate secure API key
    const apiKey = `gsa_${crypto.randomBytes(32).toString('hex')}`
    
    const newKey = await prisma.adminApiKey.create({
      data: {
        key: apiKey,
        name: name || 'Grapsee Admin Key',
        permissions: JSON.stringify(permissions || ['read', 'write', 'delete']),
        isActive: true
      }
    })
    
    return NextResponse.json({
      success: true,
      apiKey: apiKey,
      id: newKey.id,
      message: 'API Key generated. Save this key - it won\'t be shown again!'
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate API key' }, { status: 500 })
  }
}
