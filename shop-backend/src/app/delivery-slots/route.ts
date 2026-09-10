import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slotId, orderId, instructions } = await req.json()

    // Check slot availability
    const slot = await prisma.deliverySlot.findUnique({
      where: { id: slotId }
    })

    if (!slot || !slot.isAvailable) {
      return NextResponse.json({ error: 'Slot not available' }, { status: 400 })
    }

    if (slot.booked >= slot.capacity) {
      return NextResponse.json({ error: 'Slot is full' }, { status: 400 })
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
        instructions
      }
    })

    // Update order with delivery slot
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        deliverySlotId: slotId,
        deliveryInstructions: instructions
      }
    })

    return NextResponse.json({
      success: true,
      booking,
      slot: {
        date: slot.date,
        timeStart: slot.timeStart,
        timeEnd: slot.timeEnd
      },
      message: `Delivery scheduled for ${slot.date.toLocaleDateString()} between ${slot.timeStart} - ${slot.timeEnd}`
    })
  } catch (error) {
    console.error('Slot booking error:', error)
    return NextResponse.json({ error: 'Failed to book slot' }, { status: 500 })
  }
}

// Admin: Create slots (for cron job or admin panel)
export async function PUT(req: NextRequest) {
  try {
    const { date, slots } = await req.json()

    const slotDate = new Date(date)
    
    // Create slots for the day
    const createdSlots = []
    for (const slot of slots) {
      const created = await prisma.deliverySlot.create({
        data: {
          date: slotDate,
          timeStart: slot.timeStart,
          timeEnd: slot.timeEnd,
          capacity: slot.capacity || 5
        }
      })
      createdSlots.push(created)
    }

    return NextResponse.json({
      success: true,
      created: createdSlots.length
    })
  } catch (error) {
    console.error('Slot creation error:', error)
    return NextResponse.json({ error: 'Failed to create slots' }, { status: 500 })
  }
}
