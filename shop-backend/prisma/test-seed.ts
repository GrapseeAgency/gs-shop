import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testSeed() {
  console.log('🌱 Creating test data...\n')

  // Create test user
  const testEmail = 'test@grapsee.shop'
  const testPassword = 'test123'
  
  const hashedPassword = await bcrypt.hash(testPassword, 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: testEmail },
    update: {},
    create: {
      email: testEmail,
      name: 'Test User',
      password: hashedPassword,
      role: 'USER',
    },
  })
  
  console.log('✅ Test User Created:')
  console.log(`   Email: ${testEmail}`)
  console.log(`   Password: ${testPassword}`)
  console.log(`   ID: ${testUser.id}\n`)

  // Create test category first (required for product)
  const testCategory = await prisma.category.upsert({
    where: { slug: 'test-products' },
    update: {},
    create: {
      name: 'Test Products',
      slug: 'test-products',
      description: 'Category for testing',
    },
  })
  
  console.log('✅ Test Category Created:')
  console.log(`   Name: ${testCategory.name}`)
  console.log(`   Slug: ${testCategory.slug}\n`)

  // Create test product
  const testProduct = await prisma.product.upsert({
    where: { slug: 'test-product-001' },
    update: {
      inventory: 100,
      isSold: false,
      isActive: true,
    },
    create: {
      name: 'Test Product',
      slug: 'test-product-001',
      description: 'A test product for development',
      price: 99.99,
      comparePrice: 129.99,
      inventory: 100,
      categoryId: testCategory.id,
      images: JSON.stringify(['https://placehold.co/400x400/green/white?text=Test+Product']),
      isActive: true,
      isSold: false,
      sku: 'TEST-001',
    },
  })
  
  console.log('✅ Test Product Created:')
  console.log(`   Name: ${testProduct.name}`)
  console.log(`   Price: $${testProduct.price}`)
  console.log(`   ID: ${testProduct.id}`)
  console.log(`   Category: ${testCategory.name}\n`)

  console.log('🎉 Test data ready!')
  console.log('\n📧 Login Credentials:')
  console.log(`   Email: ${testEmail}`)
  console.log(`   Password: ${testPassword}`)
}

testSeed()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
