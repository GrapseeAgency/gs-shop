import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - Get specific user by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true,
        name: true,
        email: true,
        grapseeId: true,
        role: true,
        isActive: true,
        rewardsPoints: true,
        loyaltyTier: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: { }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// PUT - Update user role
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { role, isActive, rewardsPoints, loyaltyTier } = body

    const updateData: any = {}
    
    if (role !== undefined) {
      const validRoles = ['customer', 'admin', 'seller', 'moderator']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 })
      }
      updateData.role = role
    }
    
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    if (rewardsPoints !== undefined) updateData.rewardsPoints = Number(rewardsPoints)
    if (loyaltyTier !== undefined) {
      const validTiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
      if (!validTiers.includes(loyaltyTier)) {
        return NextResponse.json({ error: `Invalid tier. Must be one of: ${validTiers.join(', ')}` }, { status: 400 })
      }
      updateData.loyaltyTier = loyaltyTier
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        rewardsPoints: true,
        loyaltyTier: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
