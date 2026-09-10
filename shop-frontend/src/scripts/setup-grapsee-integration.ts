import { prisma } from '../lib/prisma'

async function main() {
  const shopApiKey = process.env.GRAPSEE_SHOP_API_KEY

  if (!shopApiKey) {
    throw new Error('GRAPSEE_SHOP_API_KEY is required')
  }

  await prisma.adminApiKey.upsert({
    where: { key: shopApiKey },
    update: {
      name: 'Grapsee Main Admin Panel',
      permissions: JSON.stringify(['read', 'write', 'delete']),
      isActive: true
    },
    create: {
      key: shopApiKey,
      name: 'Grapsee Main Admin Panel',
      permissions: JSON.stringify(['read', 'write', 'delete']),
      isActive: true
    }
  })

  console.log('Grapsee integration API key is registered and active.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
