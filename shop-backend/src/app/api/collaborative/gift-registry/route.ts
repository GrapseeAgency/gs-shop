// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get gift registry
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const registryId = searchParams.get('registryId')

    if (!registryId) {
      return NextResponse.json({ error: 'Registry ID required' }, { status: 400 })
    }

    const registry = await prisma.giftRegistry.findUnique({
      where: { id: registryId },
      include: {
        owner: { select: { name: true, avatar: true } },
        items: {
          include: { product: true },
          orderBy: { priority: 'desc' }
        },
        contributions: {
          include: { contributor: { select: { name: true } } }
        }
      }
    })

    if (!registry) {
      return NextResponse.json({ error: 'Registry not found' }, { status: 404 })
    }

    const totalValue = registry.items.reduce((sum, item) => sum + (item.product?.price || 0), 0)
    const fundedAmount = registry.contributions.reduce((sum, c) => sum + c.amount, 0)
    const percentFunded = Math.round((fundedAmount / totalValue) * 100)

    return NextResponse.json({
      registry: {
        id: registry.id,
        title: registry.title,
        occasion: registry.occasion,
        owner: registry.owner,
        eventDate: registry.eventDate,
        items: registry.items.map(item => ({
          ...item,
          funded: registry.contributions
            .filter(c => c.itemId === item.id)
            .reduce((sum, c) => sum + c.amount, 0)
        })),
        totalValue,
        fundedAmount,
        percentFunded,
        contributors: registry.contributions.length
      }
    })
  } catch (error) {
    console.error('Registry error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Create or contribute to registry
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { action } = await req.json()

    if (action === 'create' && userId) {
      const { title, occasion, eventDate, description } = await req.json()

      const registry = await prisma.giftRegistry.create({
        data: {
          ownerId: userId,
          title,
          occasion,
          eventDate: new Date(eventDate),
          description,
          isPublic: true,
          createdAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        registry: {
          id: registry.id,
          title: registry.title,
          shareUrl: `${process.env.NEXT_PUBLIC_URL}/registry/${registry.id}`
        },
        message: 'Gift registry created! Share the link with friends and family.'
      })
    }

    if (action === 'add_item' && userId) {
      const { registryId, productId, priority = 1 } = await req.json()

      await prisma.registryItem.create({
        data: {
          registryId,
          productId,
          priority,
          addedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Item added to registry'
      })
    }

    if (action === 'contribute') {
      const { registryId, itemId, amount, message } = await req.json()
      const contributorId = userId || 'anonymous'

      const contribution = await prisma.registryContribution.create({
        data: {
          registryId,
          itemId,
          contributorId,
          amount,
          message,
          contributedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        contribution,
        message: 'Thank you for your contribution!',
        receipt: true
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Registry action error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
