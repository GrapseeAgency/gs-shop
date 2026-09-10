import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get user's pay later requests
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = { userId }
    if (status) {
      where.status = status
    }

    const payLaterList = await prisma.payLater.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Calculate totals
    const totalDue = payLaterList
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + p.amount, 0)

    const overdue = payLaterList.filter(p => {
      return p.status === 'active' && new Date(p.dueDate) < new Date()
    })

    return NextResponse.json({
      payLater: payLaterList,
      summary: {
        totalDue,
        overdueCount: overdue.length,
        overdueAmount: overdue.reduce((sum, p) => sum + p.amount, 0)
      }
    })
  } catch (error) {
    console.error('Pay later fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch pay later data' }, { status: 500 })
  }
}

// POST - Create pay later request
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, amount, dueDays = 14 } = await req.json()

    // Check if user has existing active pay later
    const activeCount = await prisma.payLater.count({
      where: { userId, status: 'active' }
    })

    if (activeCount >= 3) {
      return NextResponse.json({ 
        error: 'Maximum 3 active pay later orders allowed. Please clear existing dues first.' 
      }, { status: 400 })
    }

    // Calculate due date
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueDays)

    const payLater = await prisma.payLater.create({
      data: {
        userId,
        orderId,
        amount,
        dueDate,
        status: 'active'
      }
    })

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'confirmed',
        paymentMethod: 'pay_later'
      }
    })

    return NextResponse.json({
      success: true,
      payLater,
      message: `Pay later activated. Pay ${amount} by ${dueDate.toLocaleDateString()}`
    })
  } catch (error) {
    console.error('Pay later creation error:', error)
    return NextResponse.json({ error: 'Failed to create pay later' }, { status: 500 })
  }
}

// PUT - Pay off pay later
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { payLaterId, paymentMethod } = await req.json()

    const payLater = await prisma.payLater.findFirst({
      where: { id: payLaterId, userId }
    })

    if (!payLater) {
      return NextResponse.json({ error: 'Pay later record not found' }, { status: 404 })
    }

    if (payLater.status !== 'active') {
      return NextResponse.json({ error: 'Already paid or cancelled' }, { status: 400 })
    }

    await prisma.payLater.update({
      where: { id: payLaterId },
      data: { 
        status: 'paid',
        paidAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment successful. Thank you!'
    })
  } catch (error) {
    console.error('Pay later payment error:', error)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
