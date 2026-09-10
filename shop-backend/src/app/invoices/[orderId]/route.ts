import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Return invoice-specific data
    const invoice = {
      invoiceNumber: `INV-${order.id.slice(-8).toUpperCase()}`,
      invoiceDate: order.createdAt,
      dueDate: order.createdAt,
      company: {
        name: 'Grapsee Shop',
        domain: 'captainpiracy.shop',
        email: 'support@grapsee.shop',
        phone: '+1 (555) 000-0000',
      },
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      order: {
        id: order.id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        couponCode: order.couponCode,
        discount: order.discount,
        total: order.total,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
        })),
        createdAt: order.createdAt,
      },
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}
