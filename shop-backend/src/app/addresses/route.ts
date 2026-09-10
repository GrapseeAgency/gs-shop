import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/addresses?userId=xxx List addresses by userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ data: addresses })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

// POST /api/addresses Create a new address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, label, name, phone, address, city, area, postalCode, isDefault } = body

    if (!userId || !name || !phone || !address || !city) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, phone, address, city' },
        { status: 400 }
      )
    }

    // If this is set as default, unset any existing default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label: label || 'home',
        name,
        phone,
        address,
        city,
        area: area || null,
        postalCode: postalCode || null,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json(newAddress, { status: 201 })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
}
