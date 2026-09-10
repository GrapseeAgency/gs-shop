import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.product.update({
    where: { id: 'cmpwi1sav0003vzqsk51iqob6' },
    data: { isSold: false, inventory: 1 }
  });
  console.log('Test product reset');
}
main().finally(() => prisma.$disconnect());
