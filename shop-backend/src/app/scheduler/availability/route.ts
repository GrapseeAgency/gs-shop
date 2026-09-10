import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const schedulerId = searchParams.get('schedulerId')
  const date = searchParams.get('date')
  
  if (!schedulerId || !date) {
    return NextResponse.json({ error: 'schedulerId and date required' }, { status: 400 })
  }
  
    const slots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]
  
  const bookedSlots = await prisma.appointment.findMany({
    where: { schedulerId, slot: { startsWith: date } },
    select: { slot: true }
  })
  
  const booked = bookedSlots.map(b => b.slot.split('T')[1])
  const available = slots.filter(s => !booked.includes(s))
  
  return NextResponse.json({
    date,
    availableSlots: available,
    timezone: 'Asia/Dhaka'
  })
}
