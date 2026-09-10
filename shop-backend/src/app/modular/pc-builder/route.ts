import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PC_COMPONENTS = {
  cpu: ['Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'],
  gpu: ['RTX 4060', 'RTX 4070', 'RTX 4080', 'RTX 4090', 'RX 7600', 'RX 7700 XT'],
  ram: ['16GB DDR5', '32GB DDR5', '64GB DDR5'],
  storage: ['512GB NVMe', '1TB NVMe', '2TB NVMe', '4TB NVMe'],
  psu: ['550W', '650W', '750W', '850W', '1000W'],
  motherboard: ['B650', 'X670', 'Z790', 'B760'],
  case: ['Mid Tower', 'Full Tower', 'Mini ITX']
}

const COMPATIBILITY_RULES: Record<string, any> = {
  'Intel i9': { minPSU: 750, recommendedRAM: '32GB DDR5' },
  'RTX 4090': { minPSU: 850, requires: 'high_end_cpu' },
  'RTX 4080': { minPSU: 750 },
  '64GB DDR5': { requires: 'high_end_motherboard' }
}

const PRICES: Record<string, number> = {
  'Intel i5': 25000, 'Intel i7': 45000, 'Intel i9': 65000,
  'AMD Ryzen 5': 22000, 'AMD Ryzen 7': 40000, 'AMD Ryzen 9': 60000,
  'RTX 4060': 35000, 'RTX 4070': 55000, 'RTX 4080': 95000, 'RTX 4090': 175000,
  '16GB DDR5': 8000, '32GB DDR5': 15000, '64GB DDR5': 35000,
  '512GB NVMe': 6000, '1TB NVMe': 10000, '2TB NVMe': 18000, '4TB NVMe': 35000,
  '550W': 5000, '650W': 7000, '750W': 9000, '850W': 12000, '1000W': 18000,
  'B650': 15000, 'X670': 28000, 'Z790': 30000, 'B760': 14000,
  'Mid Tower': 6000, 'Full Tower': 10000, 'Mini ITX': 8000
}

// GET - Get available components
export async function GET(req: NextRequest) {
  return NextResponse.json({
    components: PC_COMPONENTS,
    prices: PRICES,
    compatibility: COMPATIBILITY_RULES
  })
}

// POST - Check compatibility and calculate price
export async function POST(req: NextRequest) {
  try {
    const { build } = await req.json()
    
    const warnings = []
    const totalPrice = (Object.values(build) as string[]).reduce((sum: number, component: string) => {
      return sum + (PRICES[component] || 0)
    }, 0)

    // Check PSU wattage
    const psuWattage = parseInt(build.psu)
    const gpuRequirements = COMPATIBILITY_RULES[build.gpu]
    const cpuRequirements = COMPATIBILITY_RULES[build.cpu]

    if (gpuRequirements?.minPSU && psuWattage < gpuRequirements.minPSU) {
      warnings.push(` ${build.gpu} requires at least ${gpuRequirements.minPSU}W PSU. You selected ${build.psu}.`)
    }

    if (cpuRequirements?.minPSU && psuWattage < cpuRequirements.minPSU) {
      warnings.push(` ${build.cpu} recommends at least ${cpuRequirements.minPSU}W PSU.`)
    }

    // Check RAM compatibility
    if (build.ram === '64GB DDR5' && !['X670', 'Z790'].includes(build.motherboard)) {
      warnings.push(` 64GB RAM works best with X670 or Z790 motherboards.`)
    }

    // Performance score
    let performanceScore = 0
    if (build.cpu?.includes('i9') || build.cpu?.includes('Ryzen 9')) performanceScore += 40
    else if (build.cpu?.includes('i7') || build.cpu?.includes('Ryzen 7')) performanceScore += 30
    else performanceScore += 20

    if (build.gpu?.includes('4090')) performanceScore += 40
    else if (build.gpu?.includes('4080')) performanceScore += 35
    else if (build.gpu?.includes('4070')) performanceScore += 30
    else performanceScore += 20

    if (build.ram?.includes('64GB')) performanceScore += 20
    else if (build.ram?.includes('32GB')) performanceScore += 15
    else performanceScore += 10

    return NextResponse.json({
      totalPrice,
      formattedPrice: `${totalPrice.toLocaleString()}`,
      warnings,
      compatibility: warnings.length === 0 ? 'compatible' : 'issues_found',
      performanceScore,
      scoreRating: performanceScore >= 90 ? 'Excellent' : performanceScore >= 70 ? 'Great' : performanceScore >= 50 ? 'Good' : 'Entry Level',
      recommendations: warnings.length > 0 ? ['Consider upgrading PSU', 'Check component compatibility'] : []
    })
  } catch (error) {
    console.error('PC builder error:', error)
    return NextResponse.json({ error: 'Failed to calculate' }, { status: 500 })
  }
}
