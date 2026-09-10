import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Shipping rate configuration
const BASE_RATE_PER_KG = 80 // BDT per kg
const DISTANCE_ZONES: Record<string, number> = {
  // Zone multiplier based on regions in Bangladesh
  dhaka: 1.0,
  chittagong: 1.3,
  sylhet: 1.4,
  rajshahi: 1.5,
  khulna: 1.4,
  barishal: 1.5,
  rangpur: 1.6,
  mymensingh: 1.3,
}

const METHOD_MULTIPLIERS: Record<string, { multiplier: number; days: string; name: string }> = {
  standard: { multiplier: 1.0, days: '5-7', name: 'Standard Delivery' },
  express: { multiplier: 1.8, days: '2-3', name: 'Express Delivery' },
  same_day: { multiplier: 3.0, days: '0-1', name: 'Same Day Delivery' },
  overnight: { multiplier: 2.5, days: '1', name: 'Overnight Delivery' },
}

// POST /api/shipping/calculator Calculate shipping cost
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin, destination, weight, method } = body

    // Validate required fields
    if (!origin) {
      return NextResponse.json(
        { error: 'Origin city is required' },
        { status: 400 }
      )
    }
    if (!destination) {
      return NextResponse.json(
        { error: 'Destination city is required' },
        { status: 400 }
      )
    }
    if (!weight || weight <= 0) {
      return NextResponse.json(
        { error: 'Valid weight (kg) is required' },
        { status: 400 }
      )
    }

    // Try to fetch shipping methods from DB for reference
    let dbShippingMethods: Array<Record<string, unknown>> = []
    try {
      dbShippingMethods = await prisma.shippingMethod.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      })
    } catch {
      // Fallback to calculated rates
    }

    // Normalize city names for zone lookup
    const normalizeCity = (city: string) => {
      const lower = city.toLowerCase().trim()
      // Map common city names to zones
      if (lower.includes('dhaka') || lower.includes('dhk')) return 'dhaka'
      if (lower.includes('chittagong') || lower.includes('ctg') || lower.includes('chattogram')) return 'chittagong'
      if (lower.includes('sylhet')) return 'sylhet'
      if (lower.includes('rajshahi')) return 'rajshahi'
      if (lower.includes('khulna')) return 'khulna'
      if (lower.includes('barishal') || lower.includes('barisal')) return 'barishal'
      if (lower.includes('rangpur')) return 'rangpur'
      if (lower.includes('mymensingh')) return 'mymensingh'
      return 'dhaka' // Default to Dhaka zone
    }

    const originZone = normalizeCity(origin)
    const destZone = normalizeCity(destination)

    // Calculate distance factor
    const originMultiplier = DISTANCE_ZONES[originZone] || 1.0
    const destMultiplier = DISTANCE_ZONES[destZone] || 1.0
    const distanceFactor = Math.max(originMultiplier, destMultiplier)

    // Same city discount
    const isLocalDelivery = originZone === destZone

    // Calculate shipping for each method
    const methods = Object.entries(METHOD_MULTIPLIERS).map(([key, config]) => {
      // Base cost calculation
      const weightCost = weight * BASE_RATE_PER_KG
      const distanceCost = weightCost * (distanceFactor - 1) // Extra for distance
      const methodCost = (weightCost + distanceCost) * config.multiplier

      // Apply local delivery discount
      let cost = Math.round(methodCost)
      if (isLocalDelivery) {
        cost = Math.round(cost * 0.7) // 30% discount for local delivery
      }

      // Minimum cost
      cost = Math.max(cost, 60) // Minimum 60 BDT

      // Free shipping threshold for same-city standard
      const freeThreshold = key === 'standard' && isLocalDelivery ? 2000 : null

      return {
        key,
        name: config.name,
        cost,
        estimatedDays: isLocalDelivery && key === 'standard' ? '2-3' : config.days,
        isLocalDelivery,
        freeAbove: freeThreshold,
        description: isLocalDelivery
          ? `Local delivery in ${destination}`
          : `Delivery from ${origin} to ${destination}`,
      }
    })

    // If specific method requested, filter
    let resultMethods = methods
    if (method && METHOD_MULTIPLIERS[method]) {
      resultMethods = methods.filter(m => m.key === method)
    }

    // Also include DB shipping methods if available
    const dbMethodResults = dbShippingMethods.map((sm: { name?: string; price?: number; estimatedDays?: string | number; description?: string }) => ({
      key: (sm.name || 'unknown').toLowerCase().replace(/\s+/g, '_'),
      name: sm.name || 'Unknown',
      cost: typeof sm.price === 'number' ? Math.round(sm.price * distanceFactor * weight) : 0,
      estimatedDays: String(sm.estimatedDays || '3-5'),
      isLocalDelivery,
      freeAbove: null as number | null,
      description: sm.description || '',
    }))

    // Merge: prefer calculated rates, add DB-only methods
    const allMethods = [...resultMethods]
    for (const dbm of dbMethodResults) {
      if (!allMethods.find(m => m.key === dbm.key)) {
        allMethods.push(dbm)
      }
    }

    return NextResponse.json({
      origin,
      destination,
      weight,
      isLocalDelivery,
      distanceZone: destZone,
      methods: allMethods,
      cheapest: allMethods.reduce((min, m) => m.cost < min.cost ? m : min, allMethods[0]),
      fastest: allMethods.reduce((fast, m) => {
        const days = parseInt(m.estimatedDays.split('-')[0])
        const fastDays = parseInt(fast.estimatedDays.split('-')[0])
        return days < fastDays ? m : fast
      }, allMethods[0]),
    })
  } catch (error) {
    console.error('Shipping calculator error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    )
  }
}
