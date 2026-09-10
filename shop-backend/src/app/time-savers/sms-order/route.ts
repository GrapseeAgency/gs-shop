import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Handle SMS orders
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, message, userId } = await req.json()

    // Parse SMS command
    const command = parseSMSCommand(message)

    if (command.type === 'order') {
      // Find product
      const product = await prisma.product.findFirst({
        where: {
          isActive: true,
          OR: [
            { name: { contains: command.product } },
            { tags: { contains: command.product.toLowerCase() } }
          ]
        }
      })

      if (!product) {
        return NextResponse.json({
          reply: `Sorry, we couldn't find "${command.product}". Reply SEARCH [item] to browse products.`
        })
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          customerName: userId || phoneNumber || 'SMS Customer',
          customerEmail: userId || phoneNumber,
          customerPhone: phoneNumber,
          status: 'pending',
          paymentMethod: 'cod',
          total: product.price * (command.quantity || 1),
          shippingAddress: 'To be confirmed via SMS',
          items: {
            create: {
              productId: product.id,
              productName: product.name,
              quantity: command.quantity || 1,
              price: product.price
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        orderId: order.id,
        reply: `Order placed! ${product.name} x${command.quantity || 1} = ${order.total}. Cash on delivery. Reply CONFIRM ${order.id} to confirm or CANCEL to cancel.`,
        followUp: 'Reply with your delivery address to complete the order.'
      })
    }

    if (command.type === 'confirm') {
      await prisma.order.update({
        where: { id: command.orderId },
        data: { status: 'confirmed' }
      })

      return NextResponse.json({
        reply: `Order ${command.orderId} confirmed! Your items will be delivered within 2-3 days. Track: TRACK ${command.orderId}`
      })
    }

    if (command.type === 'cancel') {
      await prisma.order.update({
        where: { id: command.orderId },
        data: { status: 'cancelled' }
      })

      return NextResponse.json({
        reply: `Order ${command.orderId} cancelled. No charges applied.`
      })
    }

    return NextResponse.json({
      reply: 'Reply ORDER [item] [quantity] to place an order. Example: ORDER rice 2'
    })
  } catch (error) {
    console.error('SMS order error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function parseSMSCommand(message: string) {
  const parts = message.toUpperCase().split(' ')
  const command = parts[0]

  if (command === 'ORDER') {
    return {
      type: 'order',
      product: parts.slice(1, -1).join(' ') || parts[1],
      quantity: parseInt(parts[parts.length - 1]) || 1
    }
  }

  if (command === 'CONFIRM') {
    return { type: 'confirm', orderId: parts[1] }
  }

  if (command === 'CANCEL') {
    return { type: 'cancel', orderId: parts[1] }
  }

  return { type: 'unknown' }
}
