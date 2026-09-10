// Force reset ALL sold products with 'Test' in name
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function forceReset() {
  try {
    // Force reset any product with "Test" in the name that is marked sold
    const result = await prisma.product.updateMany({
      where: {
        name: { contains: 'Test' },
        isSold: true
      },
      data: {
        isSold: false,
        inventory: 10,
        soldTo: null,
        buyerUsername: null,
      },
    })

    console.log(`Force reset ${result.count} Test products`)

    // Also reset ALL products that are marked sold (be careful!)
    const allResult = await prisma.product.updateMany({
      where: { isSold: true },
      data: {
        isSold: false,
        inventory: 10,
        soldTo: null,
        buyerUsername: null,
      },
    })

    console.log(`Force reset ALL ${allResult.count} sold products`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forceReset()
