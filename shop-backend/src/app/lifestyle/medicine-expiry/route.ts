import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Scan and track medicine expiry
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const userId = req.headers.get('x-user-id')

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const medicineData = { name: 'Unknown Medicine', expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), batchNumber: 'N/A', manufacturer: 'Unknown' }

    const daysUntilExpiry = Math.floor((medicineData.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    // Save to user's medicine cabinet mock
    if (userId) {
      // Medicine tracking mock
    }

    return NextResponse.json({
      success: true,
      medicine: medicineData,
      daysUntilExpiry,
      status: daysUntilExpiry > 30 ? 'good' : daysUntilExpiry > 0 ? 'expiring_soon' : 'expired',
      alert: daysUntilExpiry <= 30 && daysUntilExpiry > 0
        ? ` Expires in ${daysUntilExpiry} days. Consider using soon or reordering.`
        : daysUntilExpiry <= 0
        ? ' This medicine has expired. Do not use!'
        : ` Good until ${medicineData.expiryDate.toLocaleDateString()}`,
      suggestion: daysUntilExpiry <= 30 ? {
        action: 'reorder',
        message: 'Would you like to reorder this medicine?',
        reorderUrl: '/search?q=' + encodeURIComponent(medicineData.name)
      } : null
    })
  } catch (error) {
    console.error('Medicine expiry error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get all tracked medicines
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ medicines: [] })
    }

    // Mock medicines
    const medicines: any[] = []

    const expiringSoon = medicines.filter((m: any) => m.daysUntilExpiry <= 30 && m.daysUntilExpiry > 0)
    const expired = medicines.filter((m: any) => m.daysUntilExpiry <= 0)

    return NextResponse.json({
      medicines,
      total: medicines.length,
      expiringSoon: expiringSoon.length,
      expired: expired.length,
      alerts: expiringSoon.map(m => ({
        id: m.id,
        name: m.name,
        daysLeft: m.daysUntilExpiry,
        message: `${m.name} expires in ${m.daysUntilExpiry} days`
      }))
    })
  } catch (error) {
    console.error('Medicine tracker error:', error)
    return NextResponse.json({ medicines: [] })
  }
}
