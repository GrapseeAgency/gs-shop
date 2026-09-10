import { NextRequest, NextResponse } from 'next/server'

// In-memory store for user accessibility preferences
const accessibilityPreferences = new Map<string, {
  userId: string
  fontSize: string
  highContrast: boolean
  reduceMotion: boolean
  screenReader: boolean
  colorBlindMode: string
  lineHeight: string
  letterSpacing: string
  updatedAt: string
}>()

const accessibilityFeatures = {
  vision: [
    {
      id: 'font-size',
      name: 'Font Size Adjustment',
      description: 'Increase or decrease text size across the application',
      options: ['small', 'medium', 'large', 'x-large', 'xx-large'],
      default: 'medium',
      cssProperty: 'font-size',
    },
    {
      id: 'high-contrast',
      name: 'High Contrast Mode',
      description: 'Increase color contrast for better readability',
      type: 'toggle',
      default: false,
    },
    {
      id: 'color-blind',
      name: 'Color Blind Support',
      description: 'Adjust colors for various types of color vision deficiency',
      options: ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'],
      default: 'none',
    },
    {
      id: 'line-height',
      name: 'Line Height Adjustment',
      description: 'Increase line spacing for easier reading',
      options: ['normal', 'relaxed', 'loose', 'extra-loose'],
      default: 'normal',
    },
    {
      id: 'letter-spacing',
      name: 'Letter Spacing',
      description: 'Adjust space between characters',
      options: ['normal', 'wide', 'wider', 'widest'],
      default: 'normal',
    },
  ],
  motion: [
    {
      id: 'reduce-motion',
      name: 'Reduce Motion',
      description: 'Minimize animations and transitions throughout the app',
      type: 'toggle',
      default: false,
    },
    {
      id: 'auto-play',
      name: 'Auto-play Media',
      description: 'Control automatic playback of videos and animations',
      type: 'toggle',
      default: false,
    },
  ],
  interaction: [
    {
      id: 'screen-reader',
      name: 'Screen Reader Optimization',
      description: 'Enhanced ARIA labels and semantic structure for screen readers',
      type: 'toggle',
      default: false,
    },
    {
      id: 'keyboard-nav',
      name: 'Keyboard Navigation',
      description: 'Enhanced keyboard shortcuts and focus indicators',
      type: 'toggle',
      default: true,
    },
    {
      id: 'focus-indicator',
      name: 'Visible Focus Indicators',
      description: 'Show clear focus rings on interactive elements',
      type: 'toggle',
      default: true,
    },
  ],
  cognitive: [
    {
      id: 'simplified-ui',
      name: 'Simplified Interface',
      description: 'Reduce visual clutter and simplify navigation',
      type: 'toggle',
      default: false,
    },
    {
      id: 'reading-guide',
      name: 'Reading Guide',
      description: 'Show a horizontal line to help focus while reading',
      type: 'toggle',
      default: false,
    },
    {
      id: 'dyslexia-font',
      name: 'Dyslexia-Friendly Font',
      description: 'Use OpenDyslexic font for easier reading',
      type: 'toggle',
      default: false,
    },
  ],
}

const keyboardShortcuts = [
  { keys: ['Alt', 'H'], action: 'Go to Home' },
  { keys: ['Alt', 'S'], action: 'Open Search' },
  { keys: ['Alt', 'C'], action: 'Open Cart' },
  { keys: ['Alt', 'W'], action: 'Open Wishlist' },
  { keys: ['Alt', 'P'], action: 'Open Profile' },
  { keys: ['Escape'], action: 'Close modal/dialog' },
  { keys: ['Tab'], action: 'Next focusable element' },
  { keys: ['Shift', 'Tab'], action: 'Previous focusable element' },
  { keys: ['Enter'], action: 'Activate focused element' },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'guest'

    const savedPrefs = accessibilityPreferences.get(userId)

    return NextResponse.json({
      success: true,
      features: accessibilityFeatures,
      currentPreferences: savedPrefs || {
        userId,
        fontSize: 'medium',
        highContrast: false,
        reduceMotion: false,
        screenReader: false,
        colorBlindMode: 'none',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        updatedAt: null,
      },
      keyboardShortcuts,
      compliance: {
        wcagVersion: '2.1',
        level: 'AA',
        standards: [
          'WCAG 2.1 Level AA',
          'Section 508',
          'EN 301 549',
          'ADA Compliance',
        ],
      },
      meta: {
        title: ' Accessibility Settings',
        subtitle: 'Customize your experience for comfortable browsing',
        lastUpdated: savedPrefs?.updatedAt || null,
      },
    })
  } catch (error) {
    console.error('[ACCESSIBILITY] GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch accessibility settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      fontSize,
      highContrast,
      reduceMotion,
      screenReader,
      colorBlindMode,
      lineHeight,
      letterSpacing,
    } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate font size
    const validFontSizes = ['small', 'medium', 'large', 'x-large', 'xx-large']
    if (fontSize && !validFontSizes.includes(fontSize)) {
      return NextResponse.json(
        { success: false, error: `Invalid font size. Must be one of: ${validFontSizes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate color blind mode
    const validColorBlindModes = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia']
    if (colorBlindMode && !validColorBlindModes.includes(colorBlindMode)) {
      return NextResponse.json(
        { success: false, error: `Invalid color blind mode. Must be one of: ${validColorBlindModes.join(', ')}` },
        { status: 400 }
      )
    }

    const preferences = {
      userId,
      fontSize: fontSize || 'medium',
      highContrast: Boolean(highContrast),
      reduceMotion: Boolean(reduceMotion),
      screenReader: Boolean(screenReader),
      colorBlindMode: colorBlindMode || 'none',
      lineHeight: lineHeight || 'normal',
      letterSpacing: letterSpacing || 'normal',
      updatedAt: new Date().toISOString(),
    }

    accessibilityPreferences.set(userId, preferences)

    return NextResponse.json({
      success: true,
      message: 'Accessibility preferences saved successfully',
      preferences,
    })
  } catch (error) {
    console.error('[ACCESSIBILITY] POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save accessibility preferences' },
      { status: 500 }
    )
  }
}
