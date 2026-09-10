// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Track vehicle service
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vehicleType, lastServiceDate, odometer, vehicleName } = await req.json()

    const lastService = new Date(lastServiceDate)
    const monthsSinceService = Math.floor((Date.now() - lastService.getTime()) / (1000 * 60 * 60 * 24 * 30))

    // Service intervals by vehicle type
    const intervals: Record<string, { months: number; km: number }> = {
      'car': { months: 6, km: 5000 },
      'bike': { months: 3, km: 3000 },
      'scooter': { months: 4, km: 4000 }
    }

    const interval = intervals[vehicleType] || intervals.car
    const dueInMonths = interval.months - monthsSinceService
    const isOverdue = dueInMonths <= 0

    // Save tracking
    const vehicle = await prisma.vehicleTracker.create({
      data: {
        userId,
        vehicleName,
        vehicleType,
        lastServiceDate: lastService,
        odometer,
        nextServiceDue: new Date(Date.now() + dueInMonths * 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      }
    }).catch(() => null)

    // Find service centers
    const serviceCenters = await prisma.serviceCenter.findMany({
      where: { vehicleTypes: { contains: vehicleType } },
      take: 3
    }).catch(() => [])

    return NextResponse.json({
      vehicle: {
        name: vehicleName,
        type: vehicleType,
        monthsSinceService,
        dueInMonths
      },
      status: isOverdue ? 'overdue' : dueInMonths <= 1 ? 'due_soon' : 'ok',
      message: isOverdue
        ? ` ${vehicleName} is ${Math.abs(dueInMonths)} months overdue for service!`
        : dueInMonths <= 1
        ? ` ${vehicleName} service due in ${dueInMonths} month(s)`
        : ` ${vehicleName} service OK. Due in ${dueInMonths} months.`,
      serviceCenters,
      recommendation: isOverdue || dueInMonths <= 1
        ? 'Book service now to maintain warranty and prevent issues'
        : 'Schedule service in the coming weeks'
    })
  } catch (error) {
    console.error('Vehicle service error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get all vehicle reminders
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ vehicles: [] })
    }

    const vehicles = await prisma.vehicleTracker.findMany({
      where: { userId },
      orderBy: { nextServiceDue: 'asc' }
    }).catch(() => [])

    const now = new Date()
    const alerts = vehicles.map(v => {
      const daysUntil = Math.ceil((v.nextServiceDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        id: v.id,
        vehicleName: v.vehicleName,
        daysUntil,
        isOverdue: daysUntil <= 0,
        message: daysUntil <= 0
          ? ` ${v.vehicleName} service OVERDUE by ${Math.abs(daysUntil)} days!`
          : daysUntil <= 30
          ? ` ${v.vehicleName} service due in ${daysUntil} days`
          : ` ${v.vehicleName} OK - ${daysUntil} days until service`
      }
    })

    return NextResponse.json({
      vehicles: alerts,
      overdue: alerts.filter(a => a.isOverdue).length,
      dueSoon: alerts.filter(a => !a.isOverdue && a.daysUntil <= 30).length
    })
  } catch (error) {
    console.error('Vehicle reminders error:', error)
    return NextResponse.json({ vehicles: [] })
  }
}
