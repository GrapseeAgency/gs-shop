import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupTest() {
  console.log('🧹 Cleaning up test data...\n')

  // Delete test product
  await prisma.product.deleteMany({
    where: { slug: 'test-product-001' }
  })
  console.log('✅ Test Product deleted')

  // Delete test category
  await prisma.category.deleteMany({
    where: { slug: 'test-products' }
  })
  console.log('✅ Test Category deleted')

  // Delete test user
  await prisma.user.deleteMany({
    where: { email: 'test@grapsee.shop' }
  })
  console.log('✅ Test User deleted')

  console.log('\n🎉 Test data cleaned up!')
}

cleanupTest()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
