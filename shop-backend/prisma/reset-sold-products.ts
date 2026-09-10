// Reset products that were incorrectly marked as sold
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetSoldProducts() {
  try {
    // Find products marked as sold but with no completed orders
    const soldProducts = await prisma.product.findMany({
      where: {
        isSold: true,
      },
      include: {
        orderItems: {
          include: {
            order: true,
          },
        },
      },
    })

    let resetCount = 0

    for (const product of soldProducts) {
      // Check if there's a completed/paid order for this product
      const hasCompletedOrder = product.orderItems.some(
        (oi: any) => oi.order && (oi.order.status === 'paid' || oi.order.status === 'confirmed')
      )

      if (!hasCompletedOrder) {
        // Reset the product
        await prisma.product.update({
          where: { id: product.id },
          data: {
            isSold: false,
            inventory: product.isUnique ? 1 : 10, // Reset inventory
            soldTo: null,
            buyerUsername: null,
          },
        })
        console.log(`Reset product: ${product.name} (${product.id})`)
        resetCount++
      }
    }

    console.log(`\nTotal products reset: ${resetCount}`)
  } catch (error) {
    console.error('Error resetting products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetSoldProducts()
