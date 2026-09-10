import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Check medicine interactions
export async function POST(req: NextRequest) {
  try {
    const { medicines } = await req.json()

    // Drug interaction database (simplified)
    const interactions: Record<string, string[]> = {
      'aspirin': ['warfarin', 'ibuprofen'],
      'paracetamol': ['alcohol'],
      'ibuprofen': ['aspirin', 'blood thinners'],
      'warfarin': ['aspirin', 'green tea', 'cranberry'],
      'metformin': ['alcohol', 'contrast dye'],
      'atorvastatin': ['grapefruit', 'erythromycin']
    }

    const warnings: string[] = []

    // Check all combinations
    for (let i = 0; i < medicines.length; i++) {
      for (let j = i + 1; j < medicines.length; j++) {
        const med1 = medicines[i].toLowerCase()
        const med2 = medicines[j].toLowerCase()

        // Check if med1 conflicts with med2
        if (interactions[med1]?.includes(med2)) {
          warnings.push(` ${medicines[i]} + ${medicines[j]}: May cause adverse interaction`)
        }
        if (interactions[med2]?.includes(med1)) {
          warnings.push(` ${medicines[j]} + ${medicines[i]}: May cause adverse interaction`)
        }
      }
    }

    return NextResponse.json({
      medicines,
      interactionCount: warnings.length,
      warnings,
      severity: warnings.length === 0 ? 'safe' : warnings.length > 2 ? 'high' : 'medium',
      recommendation: warnings.length > 0
        ? 'Consult your doctor before taking these medicines together.'
        : 'No known interactions found. Always consult your doctor.',
      disclaimer: 'This is not medical advice. Always consult a healthcare professional.'
    })
  } catch (error) {
    console.error('Medicine interaction error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
