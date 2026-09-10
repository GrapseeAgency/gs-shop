const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function seed() {
  const apiKey = process.env.GRAPSEE_SHOP_API_KEY

  if (!apiKey) {
    console.error('❌ GRAPSEE_SHOP_API_KEY environment variable is required')
    process.exit(1)
  }

  // Check if admin API key already exists
  const existingKey = await db.adminApiKey.findUnique({
    where: { key: apiKey }
  })

  if (!existingKey) {
    await db.adminApiKey.create({
      data: {
        key: apiKey,
        name: 'Grapsee Admin Proxy Key',
        permissions: JSON.stringify(['read', 'write', 'delete']),
        isActive: true,
        lastUsed: null
      }
    })
    console.log('✅ Admin API key seeded successfully')
  } else {
    console.log('✅ Admin API key already exists')
  }
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())
