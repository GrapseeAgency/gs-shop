import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Digital Handover Cost configuration
const BASE_SETUP_RATE = 1000 // BDT base rate
const PLATFORM_MULTIPLIERS: Record<string, number> = {
  vercel: 1.0,
  netlify: 1.0,
  cloudflare: 1.1,
  vps: 1.5,
  aws: 2.0,
  gcp: 2.2,
  heroku: 1.2,
}

const HANDOVER_METHODS: Record<string, { multiplier: number; hours: string; name: string; description: string }> = {
  standard: { multiplier: 0, hours: 'Instant', name: 'Instant Zip & Email', description: 'Immediate package access inside your client dashboard' },
  github: { multiplier: 0.5, hours: '1-2 Hours', name: 'GitHub Repo Invite & Sync', description: 'Private repository transfer with future update sync' },
  setup: { multiplier: 1.5, hours: '12-24 Hours', name: 'Professional Cloud Deployment', description: 'Grapsee engineer deploys and configures the app on your server' },
  consultation: { multiplier: 3.0, hours: 'Scheduled (1h)', name: '1-on-1 Interactive Walkthrough', description: 'Zoom session for comprehensive code walkthrough & deployment setup' },
}

// POST /api/shipping/calculator Calculate digital handover setup costs & estimates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin = 'github', destination, weight = 1, orderTotal = 0 } = body

    if (!destination) {
      return NextResponse.json(
        { error: 'Target Cloud Platform is required' },
        { status: 400 }
      )
    }

    const platformKey = destination.toLowerCase().trim()
    const platformMultiplier = PLATFORM_MULTIPLIERS[platformKey] || 1.0

    // Same-origin discount (if origin and destination are simple direct downloads)
    const isInstantOnly = platformKey === 'vercel' || platformKey === 'netlify'

    const methods = Object.entries(HANDOVER_METHODS).map(([key, config]) => {
      // Base setup fee calculation based on package complexity/weight index
      const baseCost = weight * BASE_SETUP_RATE
      let setupFee = Math.round(baseCost * config.multiplier * platformMultiplier)

      // Apply discount or free tier
      let isFree = setupFee === 0
      if (key === 'setup' && orderTotal >= 5000) {
        setupFee = 0 // Free deployment for orders over 5000 BDT
        isFree = true
      }

      return {
        key,
        name: config.name,
        cost: setupFee,
        estimatedDays: config.hours, // Map 'estimatedDays' to 'hours' to keep it completely compatible
        isLocalDelivery: isInstantOnly, // Map 'isLocalDelivery' to 'isInstantOnly' for compat
        freeAbove: key === 'setup' ? 5000 : null,
        description: config.description,
      }
    })

    return NextResponse.json({
      origin,
      destination,
      weight,
      isLocalDelivery: isInstantOnly,
      distanceZone: platformKey,
      methods,
      cheapest: methods.reduce((min, m) => m.cost < min.cost ? m : min, methods[0]),
      fastest: methods.reduce((fast, m) => {
        // Instant is fastest
        if (m.estimatedDays.toLowerCase().includes('instant')) return m
        return fast
      }, methods[0]),
      freeShipping: {
        threshold: 5000,
        amountNeeded: Math.max(0, 5000 - orderTotal),
        isEligible: orderTotal >= 5000,
      }
    })
  } catch (error) {
    console.error('Digital handover calculator error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate handover provisioning costs' },
      { status: 500 }
    )
  }
}

// GET /api/shipping/calculator Get list of available platforms
export async function GET() {
  try {
    const platforms = [
      { name: 'Vercel', region: 'Serverless Cloud' },
      { name: 'Netlify', region: 'Serverless Cloud' },
      { name: 'Cloudflare Pages', region: 'Edge Network' },
      { name: 'AWS (Amazon Web Services)', region: 'Cloud Infrastructure' },
      { name: 'Google Cloud Platform (GCP)', region: 'Cloud Infrastructure' },
      { name: 'Custom VPS (DigitalOcean/Linode)', region: 'Virtual Private Server' },
      { name: 'Heroku', region: 'PaaS Cloud' },
    ]
    return NextResponse.json({ cities: platforms }) // Map to 'cities' for frontend compatibility
  } catch (error) {
    console.error('Error in calculator GET:', error)
    return NextResponse.json({ error: 'Failed to load platforms' }, { status: 500 })
  }
}
