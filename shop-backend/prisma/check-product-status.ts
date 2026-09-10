// Check product status and orders
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProductStatus() {
  try {
    // Find "Test Product" specifically
    const testProducts = await prisma.product.findMany({
      where: {
        name: { contains: 'Test' }
      },
      include: {
        orderItems: {
          include: {
            order: true,
          },
        },
      },
    })

    console.log('=== Test Products Found ===\n')

    for (const product of testProducts) {
      console.log(`Product: ${product.name}`)
      console.log(`ID: ${product.id}`)
      console.log(`isSold: ${product.isSold}`)
      console.log(`Inventory: ${product.inventory}`)
      console.log(`isUnique: ${product.isUnique}`)
      console.log(`Price: $${product.price}`)
      console.log(`\nOrders (${product.orderItems.length}):`)

      for (const oi of product.orderItems) {
        console.log(`  - Order ${oi.orderId}: ${oi.order.status} ($${oi.order.total})`)
      }

      // Check if any order is paid/confirmed
      const hasPaidOrder = product.orderItems.some(
        (oi: any) => oi.order && ['paid', 'confirmed', 'completed'].includes(oi.order.status)
      )

      console.log(`\nHas paid order: ${hasPaidOrder}`)

      if (!hasPaidOrder && product.isSold) {
        console.log('>>> SHOULD RESET THIS PRODUCT <<<')
        // Reset it
        await prisma.product.update({
          where: { id: product.id },
          data: {
            isSold: false,
            inventory: product.isUnique ? 1 : 10,
            soldTo: null,
            buyerUsername: null,
          },
        })
        console.log('>>> RESET COMPLETE <<<')
      }

      console.log('\n---\n')
    }

    // Also show ALL sold products
    const allSold = await prisma.product.findMany({
      where: { isSold: true },
      select: { id: true, name: true, inventory: true }
    })

    console.log(`\n=== All Sold Products (${allSold.length}) ===`)
    for (const p of allSold) {
      console.log(`- ${p.name} (inv: ${p.inventory})`)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductStatus()
