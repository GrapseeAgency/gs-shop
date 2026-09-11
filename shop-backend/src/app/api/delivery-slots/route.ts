import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

// GET - Get available delivery slots
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date')
    
    const date = dateStr ? new Date(dateStr) : new Date()
    date.setHours(0, 0, 0, 0)

    // Get slots for the requested date or next 14 days
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 14)

    const slots = await prisma.deliverySlot.findMany({
      where: {
        date: { gte: date, lte: endDate },
        isAvailable: true
      },
      orderBy: [{ date: 'asc' }, { timeStart: 'asc' }]
    })

    // Group by date
    const groupedSlots = slots.reduce((acc, slot) => {
      const dateKey = slot.date.toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push({
        id: slot.id,
        timeStart: slot.timeStart,
        timeEnd: slot.timeEnd,
        available: slot.capacity - slot.booked
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      slots: groupedSlots,
      dates: Object.keys(groupedSlots).map(date => ({
        date,
        dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: new Date(date).getDate()
      }))
    })
  } catch (error) {
    console.error('Delivery slots fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}

// POST - Book a delivery slot
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { slotId, orderId, instructions, userId } = body

    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    if (!slotId || !orderId) {
      return NextResponse.json({ success: false, error: 'Slot ID and Order ID are required' }, { status: 400 })
    }

    // Verify order belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, customerEmail: true, status: true, total: true }
    })

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    if (order.customerEmail !== targetUserId) {
      return NextResponse.json({ success: false, error: 'Order does not belong to this user' }, { status: 403 })
    }

    // Check slot availability
    const slot = await prisma.deliverySlot.findUnique({
      where: { id: slotId }
    })

    if (!slot || !slot.isAvailable) {
      return NextResponse.json({ success: false, error: 'Slot not available' }, { status: 400 })
    }

    if (slot.booked >= slot.capacity) {
      return NextResponse.json({ success: false, error: 'Slot is full' }, { status: 400 })
    }

    // Check if order already has a delivery slot
    const existingBooking = await prisma.deliveryBooking.findFirst({
      where: { orderId }
    })

    if (existingBooking) {
      return NextResponse.json({ success: false, error: 'Order already has a delivery slot booked' }, { status: 409 })
    }

    // Update slot booking count
    await prisma.deliverySlot.update({
      where: { id: slotId },
      data: { booked: { increment: 1 } }
    })

    // Create booking
    const booking = await prisma.deliveryBooking.create({
      data: {
        orderId,
        slotId,
        instructions: instructions || null,
        userId: targetUserId
      }
    })

    // Update order with delivery slot
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        deliverySlotId: slotId,
        deliveryInstructions: instructions || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        booking,
        slot: {
          id: slot.id,
          date: slot.date,
          timeStart: slot.timeStart,
          timeEnd: slot.timeEnd
        },
        order: {
          id: order.id,
          total: order.total
        }
      },
      message: `Delivery scheduled for ${slot.date.toLocaleDateString()} between ${slot.timeStart} - ${slot.timeEnd}`
    })
  } catch (error) {
    console.error('Slot booking error:', error)
    return NextResponse.json({ success: false, error: 'Failed to book slot' }, { status: 500 })
  }
}

// Admin: Create slots (for cron job or admin panel)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const { date, slots } = await req.json()

    if (!date || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ success: false, error: 'Date and slots array are required' }, { status: 400 })
    }

    const slotDate = new Date(date)
    
    // Create slots for the day
    const createdSlots = []
    for (const slot of slots) {
      if (!slot.timeStart || !slot.timeEnd) {
        continue // Skip invalid slots
      }
      
      const created = await prisma.deliverySlot.create({
        data: {
          date: slotDate,
          timeStart: slot.timeStart,
          timeEnd: slot.timeEnd,
          capacity: slot.capacity || 5,
          isAvailable: true
        }
      })
      createdSlots.push(created)
    }

    return NextResponse.json({
      success: true,
      data: {
        created: createdSlots.length,
        slots: createdSlots
      }
    })
  } catch (error) {
    console.error('Slot creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create slots' }, { status: 500 })
  }
}

// DELETE - Cancel a delivery slot booking
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId') || session?.user?.id

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Booking ID is required' }, { status: 400 })
    }

    // Find the booking and verify ownership
    const booking = await prisma.deliveryBooking.findUnique({
      where: { id: bookingId },
      include: {
        slot: {
          select: { id: true, date: true, timeStart: true, timeEnd: true }
        },
        order: {
          select: { id: true, customerEmail: true, status: true }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    if (booking.userId !== userId && booking.order.customerEmail !== userId) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    // Check if booking can be cancelled (e.g., not too close to delivery time)
    const slotDateTime = new Date(`${booking.slot.date.toISOString().split('T')[0]}T${booking.slot.timeStart}`)
    const now = new Date()
    const hoursUntilDelivery = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilDelivery < 2) {
      return NextResponse.json({ success: false, error: 'Cannot cancel booking less than 2 hours before delivery' }, { status: 400 })
    }

    // Delete the booking and update slot capacity
    await prisma.$transaction(async (tx) => {
      await tx.deliveryBooking.delete({
        where: { id: bookingId }
      })

      await tx.deliverySlot.update({
        where: { id: booking.slotId },
        data: { booked: { decrement: 1 } }
      })

      await tx.order.update({
        where: { id: booking.orderId },
        data: { 
          deliverySlotId: null,
          deliveryInstructions: null
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Delivery slot cancelled successfully',
      data: {
        cancelledBooking: {
          id: booking.id,
          slot: booking.slot,
          orderId: booking.orderId
        }
      }
    })
  } catch (error) {
    console.error('Slot cancellation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to cancel slot' }, { status: 500 })
  }
}
