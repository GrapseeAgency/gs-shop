import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, schedulerId, slot, attendeeInfo, notes } = body
  
  const appointment = await prisma.appointment.create({
    data: {
      userId,
      schedulerId,
      slot,
      attendeeName: attendeeInfo.name,
      attendeeEmail: attendeeInfo.email,
      notes,
      status: 'confirmed',
      calendarEventId: `evt_${Date.now()}`
    }
  })
  
  return NextResponse.json({
    appointmentId: appointment.id,
    confirmationCode: appointment.calendarEventId,
    message: 'Appointment booked successfully',
    calendarInvite: `mailto:${attendeeInfo.email}?subject=Meeting%20Confirmed`
  })
}
