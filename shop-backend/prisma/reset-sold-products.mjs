// Reset all products that were incorrectly marked as sold
// This fixes the leftover isSold=true from the old bug where
// the orders API marked products sold before payment succeeded.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find all products currently marked as sold
  const soldProducts = await prisma.product.findMany({
    where: { isSold: true },
    select: { id: true, name: true, isSold: true, inventory: true, soldTo: true },
  });

  console.log(`Found ${soldProducts.length} product(s) marked as sold:`);
  soldProducts.forEach(p => {
    console.log(`  - ${p.name} (id: ${p.id}, inventory: ${p.inventory}, soldTo: ${p.soldTo || 'nobody'})`);
  });

  // Check which of these have a PAID order (meaning they were legitimately sold)
  const legitimatelySold = [];
  const incorrectlySold = [];

  for (const product of soldProducts) {
    const paidOrder = await prisma.order.findFirst({
      where: {
        status: 'paid',
        items: { some: { productId: product.id } },
      },
    });

    if (paidOrder) {
      legitimatelySold.push(product);
    } else {
      incorrectlySold.push(product);
    }
  }

  console.log(`\nLegitimately sold (has paid order): ${legitimatelySold.length}`);
  legitimatelySold.forEach(p => console.log(`  ✅ ${p.name}`));

  console.log(`Incorrectly sold (no paid order): ${incorrectlySold.length}`);
  incorrectlySold.forEach(p => console.log(`  ❌ ${p.name}`));

  // Reset only incorrectly sold products
  if (incorrectlySold.length > 0) {
    for (const product of incorrectlySold) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          isSold: false,
          inventory: product.inventory <= 0 ? 1 : product.inventory,
          soldTo: null,
          buyerUsername: null,
        },
      });
      console.log(`  🔄 Reset: ${product.name}`);
    }
    console.log(`\n✅ Reset ${incorrectlySold.length} product(s) successfully!`);
  } else {
    console.log('\n✅ No products need resetting.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
