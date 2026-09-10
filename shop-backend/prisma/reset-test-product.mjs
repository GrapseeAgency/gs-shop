import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetTestProduct() {
  try {
    // Reset Test Product sold status
    const result = await prisma.product.updateMany({
      where: {
        name: {
          contains: 'Test'
        },
        isSold: true
      },
      data: {
        isSold: false,
        inventory: 1
      }
    });
    
    console.log(`Reset ${result.count} test product(s)`);
    
    // Also reset by specific ID if needed
    const byId = await prisma.product.updateMany({
      where: {
        id: 'cmpwi1sav0003vzqsk51iqob6'
      },
      data: {
        isSold: false,
        inventory: 1
      }
    });
    
    console.log(`Reset by ID: ${byId.count} product(s)`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetTestProduct();
