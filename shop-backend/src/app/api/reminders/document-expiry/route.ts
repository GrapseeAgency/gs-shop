// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Add document for tracking
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentType, documentNumber, expiryDate, renewUrl } = await req.json()

    const document = await prisma.documentTracker.create({
      data: {
        userId,
        documentType,
        documentNumber,
        expiryDate: new Date(expiryDate),
        renewUrl,
        status: 'active',
        addedAt: new Date()
      }
    })

    const daysUntil = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        type: documentType,
        number: documentNumber,
        expiryDate,
        daysUntil
      },
      reminder: daysUntil <= 60
        ? ` ${documentType} expires in ${daysUntil} days. Start renewal process.`
        : ` ${documentType} tracked. Reminder set for 60 days before expiry.`,
      nextSteps: renewUrl ? `Renew here: ${renewUrl}` : 'Contact relevant authority for renewal'
    })
  } catch (error) {
    console.error('Document tracker error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get all document reminders
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ documents: [] })
    }

    const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    const now = new Date()

    const documents = await prisma.documentTracker.findMany({
      where: {
        userId,
        expiryDate: { lte: sixtyDaysFromNow }
      },
      orderBy: { expiryDate: 'asc' }
    })

    const alerts = documents.map(d => {
      const daysUntil = Math.ceil((d.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        id: d.id,
        type: d.documentType,
        number: d.documentNumber,
        daysUntil,
        urgency: daysUntil <= 7 ? 'high' : daysUntil <= 30 ? 'medium' : 'low',
        message: daysUntil <= 0
          ? ` ${d.documentType} EXPIRED! Renew immediately.`
          : daysUntil <= 7
          ? ` ${d.documentType} expires in ${daysUntil} days!`
          : ` ${d.documentType} expires in ${daysUntil} days.`,
        renewUrl: d.renewUrl
      }
    })

    return NextResponse.json({
      documents: alerts,
      expiringSoon: alerts.filter(d => d.daysUntil <= 30 && d.daysUntil > 0).length,
      expired: alerts.filter(d => d.daysUntil <= 0).length,
      message: alerts.length > 0
        ? `You have ${alerts.length} documents expiring soon.`
        : 'All documents are valid for the next 60 days.'
    })
  } catch (error) {
    console.error('Document reminder error:', error)
    return NextResponse.json({ documents: [] })
  }
}
