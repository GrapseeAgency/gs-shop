import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user's wallet transactions for open source contributions
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          where: {
            description: { contains: 'Open Source' }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!wallet) {
      return NextResponse.json({
        projects: [],
        total: 0
      })
    }

    const projects = wallet.transactions.map(tx => ({
      id: tx.id,
      projectId: tx.referenceId || 'unknown',
      projectName: tx.description.replace('Open Source Contribution: ', ''),
      amount: tx.amount,
      fundedAt: tx.createdAt.toISOString()
    }))

    const total = projects.reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      projects,
      total,
      count: projects.length
    })

  } catch (error) {
    console.error('[OPEN_SOURCE_FUNDED]', error)
    return NextResponse.json(
      { error: 'Failed to fetch funded projects' },
      { status: 500 }
    )
  }
}
