import { NextRequest, NextResponse } from 'next/server'

// POST - Match appliance repair needs with technicians
export async function POST(req: NextRequest) {
  try {
    const { applianceType, problem, urgency } = await req.json()
    const userId = req.headers.get('x-user-id')

    // Mock technicians
    const technicians = [
      { id: '1', name: 'John Repair', rating: 4.8, specialization: applianceType, baseFee: 200, available: true },
      { id: '2', name: 'Jane Fixit', rating: 4.5, specialization: applianceType, baseFee: 180, available: true }
    ]

    // Estimate repair costs
    const costEstimate = getCostEstimate(applianceType, problem)

    // Calculate ETA
    const eta = urgency === 'emergency' ? 'Within 2 hours' : 'Within 24 hours'

    // Mock repair request
    const repairRequest = {
      id: 'mock-' + Date.now(),
      userId: userId || 'anonymous',
      applianceType,
      problem,
      urgency,
      status: 'pending',
      createdAt: new Date(),
      estimatedCost: costEstimate.average
    }

    return NextResponse.json({
      success: true,
      request: repairRequest,
      technicians: technicians.map(t => ({
        id: t.id,
        name: t.name,
        rating: t.rating,
        reviews: 12,
        specialization: t.specialization,
        eta,
        baseFee: t.baseFee,
        available: t.available
      })),
      costEstimate,
      eta,
      message: `Found ${technicians.length} verified technicians for your ${applianceType} repair!`,
      bookUrl: `/repair/book/${repairRequest.id}`
    })
  } catch (error) {
    console.error('Repair matcher error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function getCostEstimate(appliance: string, problem: string) {
  const baseCosts: Record<string, { min: number; max: number }> = {
    'ac': { min: 500, max: 3000 },
    'fridge': { min: 400, max: 2500 },
    'washing machine': { min: 300, max: 2000 },
    'tv': { min: 300, max: 4000 },
    'microwave': { min: 200, max: 1500 }
  }

  const base = baseCosts[appliance.toLowerCase()] || { min: 300, max: 2000 }

  return {
    min: base.min,
    max: base.max,
    average: Math.round((base.min + base.max) / 2)
  }
}
