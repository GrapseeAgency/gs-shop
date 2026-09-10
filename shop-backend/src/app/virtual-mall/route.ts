import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get virtual mall layout and store positions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const zone = searchParams.get('zone') || 'main'
    
    // Get featured stores for virtual mall
    const stores = await prisma.seller.findMany({
      where: { isVerified: true },
            take: 12,
      select: {
        id: true,
        name: true,
        logo: true,
        rating: true,
        productCount: true,
        featuredProducts: true
      }
    })

    // Generate mall layout with positions
    const mallLayout = {
      zone,
      stores: stores.map((store, index) => ({
        ...store,
        position: {
          x: (index % 4) * 250,
          z: Math.floor(index / 4) * 200,
          rotation: index % 2 === 0 ? 0 : 180
        },
        avatar: {
          greeting: `Welcome to ${store.name}!`,
          idleAnimation: 'wave',
          position: { x: (index % 4) * 250, z: Math.floor(index / 4) * 200 + 50 }
        }
      })),
      hotspots: stores.map((store, index) => ({
        id: store.id,
        type: 'store',
        position: { x: (index % 4) * 250, y: 0, z: Math.floor(index / 4) * 200 },
        label: store.name
      })),
      navigation: {
        currentZone: zone,
        availableZones: ['main', 'electronics', 'fashion', 'home'],
        exits: [
          { to: 'electronics', position: { x: 1000, z: 0 }, label: 'To Electronics' },
          { to: 'fashion', position: { x: -100, z: 800 }, label: 'To Fashion' }
        ]
      }
    }

    return NextResponse.json({ layout: mallLayout })
  } catch (error) {
    console.error('Virtual mall error:', error)
    return NextResponse.json({ error: 'Failed to load mall' }, { status: 500 })
  }
}

// POST - Track user movement in virtual mall
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { position, storeId, action } = await req.json()

    // Track session
    if (userId) {
      await prisma.virtualMallSession.upsert({
        where: { userId },
        update: {
          lastPosition: JSON.stringify(position),
          lastStoreId: storeId,
          lastActive: new Date()
        },
        create: {
          userId,
          lastPosition: JSON.stringify(position),
          lastStoreId: storeId
        }
      })
    }

    // Log interaction
    if (action === 'enter_store' && storeId) {
      await prisma.storeVisit.create({
        data: {
          userId: userId || 'anonymous',
          sellerId: storeId,
          source: 'virtual_mall'
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mall tracking error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}
