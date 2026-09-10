import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get audit logs
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Verify admin
    const user = await prisma.user.findUnique({
      where: { id: userId || '' },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const adminId = searchParams.get('adminId')
    const action = searchParams.get('action')

    const where: any = {}
    if (adminId) where.adminId = adminId
    if (action) where.action = action

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.auditLog.count({ where
      })
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Audit log fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

// POST - Create audit log entry
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      action,
      resource,
      resourceId,
      oldValue,
      newValue,
      ipAddress,
      userAgent
    } = await req.json()

    const log = await prisma.auditLog.create({
      data: {
        adminId: userId,
        action,
        resource,
        resourceId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        ipAddress,
        userAgent
      }
    })

    return NextResponse.json({ success: true, log })
  } catch (error) {
    console.error('Audit log creation error:', error)
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
  }
}
