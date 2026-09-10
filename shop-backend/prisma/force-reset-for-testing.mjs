// Force reset the test product for testing - regardless of order status
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Reset ALL products that are marked as sold
  const result = await prisma.product.updateMany({
    where: { isSold: true },
    data: {
      isSold: false,
      inventory: 1,
      soldTo: null,
      buyerUsername: null,
    },
  });

  console.log(`✅ Force-reset ${result.count} product(s) back to available.`);

  // Also clean up any "paid" test orders so they don't block future purchases
  const orders = await prisma.order.findMany({
    where: { status: 'paid' },
    select: { id: true, customerName: true, total: true, status: true },
  });
  console.log(`\nExisting paid orders (${orders.length}):`);
  orders.forEach(o => console.log(`  - ${o.id}: ${o.customerName} ($${o.total})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
