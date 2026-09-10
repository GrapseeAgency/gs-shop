import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function verifyAdminApiKey(req: NextRequest, requiredPermission = 'read') {
  const apiKey = req.headers.get('x-api-key')

  if (!apiKey) {
    return null
  }

  const validKey = await prisma.adminApiKey.findUnique({
    where: { key: apiKey, isActive: true }
  })

  if (!validKey) {
    return null
  }

  const permissions = JSON.parse(validKey.permissions || '[]')
  if (!permissions.includes(requiredPermission) && !permissions.includes('write')) {
    return null
  }

  await prisma.adminApiKey.update({
    where: { id: validKey.id },
    data: { lastUsed: new Date() }
  })

  return validKey
}
