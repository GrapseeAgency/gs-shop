import { NextRequest, NextResponse } from 'next/server'

// POST - Calculate fuel cost vs delivery fee
export async function POST(req: NextRequest) {
  try {
    const { distance, vehicleType = 'car', fuelPrice = 102, deliveryFee } = await req.json()

    // Fuel efficiency (km per liter)
    const efficiency: Record<string, number> = {
      'car': 15,
      'bike': 40,
      'scooter': 35
    }

    const kmPerLiter = efficiency[vehicleType] || 15
    const fuelNeeded = distance / kmPerLiter
    const fuelCost = Math.round(fuelNeeded * fuelPrice)

    const isDrivingCheaper = fuelCost < deliveryFee
    const savings = Math.abs(fuelCost - deliveryFee)

    return NextResponse.json({
      comparison: {
        drive: {
          cost: fuelCost,
          details: `${distance}km @ ${kmPerLiter}km/L, fuel ${fuelPrice}/L`,
          time: `${Math.round(distance / 30 * 60)} mins` // Assuming 30km/h avg
        },
        delivery: {
          cost: deliveryFee,
          details: 'Direct to your door',
          time: '1-2 hours'
        }
      },
      recommendation: isDrivingCheaper
        ? `Drive and save ${savings}! (But consider your time)`
        : `Delivery is ${savings} cheaper. Plus you save time!`,
      winner: isDrivingCheaper ? 'drive' : 'delivery',
      note: 'Delivery includes convenience and saves your time. Consider both factors.',
      environmental: {
        driveEmissions: `${Math.round(distance * 0.12)}g CO2`,
        deliveryEmissions: `${Math.round(distance * 0.08)}g CO2` // Shared delivery = less per person
      }
    })
  } catch (error) {
    console.error('Fuel cost error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
