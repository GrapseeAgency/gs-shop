import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Handle WhatsApp bulk orders
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, message, userId } = await req.json()

    // Parse "1,3,7" format
    const itemNumbers = message.split(/[,\s]+/).map((n: string) => parseInt(n.trim())).filter((n: number) => !isNaN(n))

    // Get catalog ([] - would fetch from database)
    const catalog = [
      { id: '1', name: 'Rice 5kg', price: 250 },
      { id: '2', name: 'Dal 1kg', price: 120 },
      { id: '3', name: 'Oil 1L', price: 140 },
      { id: '4', name: 'Sugar 2kg', price: 80 },
      { id: '5', name: 'Salt 1kg', price: 20 },
      { id: '6', name: 'Tea 250g', price: 60 },
      { id: '7', name: 'Coffee 100g', price: 150 }
    ]

    const selectedItems = itemNumbers.map((num: number) => catalog[num - 1]).filter(Boolean)

    if (selectedItems.length === 0) {
      return NextResponse.json({
        reply: 'Invalid selection. Reply with item numbers like: 1,3,5',
        catalog: catalog.map((item, idx) => `${idx + 1}. ${item.name} - ${item.price}`).join('\n')
      })
    }

    const total = selectedItems.reduce((sum: number, item: any) => sum + item.price, 0)

    // Create order
    if (userId) {
      await prisma.order.create({
        data: {
          customerName: userId || phoneNumber || 'WhatsApp Customer',
          customerEmail: userId,
          customerPhone: phoneNumber,
          status: 'pending',
          paymentMethod: 'cod',
          total,
          shippingAddress: 'To be confirmed',
          source: 'whatsapp'
        }
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      items: selectedItems,
      total,
      itemCount: selectedItems.length,
      reply: `Order placed! ${selectedItems.length} items - ${total}. Cash on delivery. Reply CONFIRM to finalize or CANCEL.`,
      confirmationNeeded: true
    })
  } catch (error) {
    console.error('WhatsApp bulk order error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
