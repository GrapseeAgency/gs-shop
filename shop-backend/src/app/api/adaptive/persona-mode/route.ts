import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get current persona mode
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ mode: 'browse' })
    }

    const settings = await prisma.userAdaptiveSettings.findUnique({
      where: { userId }
    })

    return NextResponse.json({
      mode: settings?.personaMode || 'browse',
      autoDetect: settings?.autoDetectPersona || false,
      availableModes: ['browse', 'buy', 'elderly', 'kid', 'power']
    })
  } catch (error) {
    console.error('Persona mode error:', error)
    return NextResponse.json({ mode: 'browse' })
  }
}

// POST - Set persona mode
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { mode, autoDetect } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validModes = ['browse', 'buy', 'elderly', 'kid', 'power', 'left-hand', 'dark-room', 'offline', 'low-bandwidth']

    if (!validModes.includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    await prisma.userAdaptiveSettings.upsert({
      where: { userId },
      update: {
        personaMode: mode,
        autoDetectPersona: autoDetect ?? false
      },
      create: {
        userId,
        personaMode: mode,
        autoDetectPersona: autoDetect ?? false
      }
    })

    const modeConfigs: Record<string, any> = {
      browse: {
        ui: 'exploratory',
        animations: true,
        recommendations: true,
        layout: 'grid',
        speed: 'relaxed'
      },
      buy: {
        ui: 'minimal',
        animations: false,
        recommendations: false,
        layout: 'list',
        speed: 'fast',
        oneClickCheckout: true
      },
      elderly: {
        ui: 'accessible',
        fontSize: 'large',
        animations: false,
        highContrast: true,
        voiceEnabled: true,
        simplifiedNavigation: true
      },
      kid: {
        ui: 'playful',
        animations: true,
        parentalControls: true,
        spendingLimit: true,
        noCheckout: true
      },
      power: {
        ui: 'advanced',
        keyboardShortcuts: true,
        batchOperations: true,
        spreadsheetView: true,
        quickFilters: true
      },
      'left-hand': {
        ui: 'left-optimized',
        navigationPosition: 'left',
        buttonPlacement: 'left'
      },
      'dark-room': {
        ui: 'oled-black',
        background: '#000000',
        brightness: 'low',
        eyeStrainReduction: true
      },
      offline: {
        ui: 'cached',
        syncWhenOnline: true,
        offlineCart: true
      },
      'low-bandwidth': {
        ui: 'compressed',
        images: 'low-res',
        noAnimations: true,
        textOnly: false
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      config: modeConfigs[mode],
      message: `Switched to ${mode} mode`
    })
  } catch (error) {
    console.error('Persona set error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
