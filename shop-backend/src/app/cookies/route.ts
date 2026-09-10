import { NextRequest, NextResponse } from 'next/server'

// In-memory store for user cookie preferences
const cookiePreferences = new Map<string, {
  userId: string
  essential: boolean
  analytics: boolean
  marketing: boolean
  personalization: boolean
  acceptedAt: string | null
  updatedAt: string
}>()

const cookieCategories = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'Required for the website to function properly. These cannot be disabled.',
    required: true,
    defaultEnabled: true,
    cookies: [
      { name: 'session_id', purpose: 'Maintains your logged-in session', duration: 'Session', provider: 'Grapsee' },
      { name: 'csrf_token', purpose: 'Prevents cross-site request forgery attacks', duration: 'Session', provider: 'Grapsee' },
      { name: 'cart_id', purpose: 'Preserves your shopping cart contents', duration: '30 days', provider: 'Grapsee' },
      { name: 'locale', purpose: 'Remembers your language and region preference', duration: '1 year', provider: 'Grapsee' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand how visitors interact with our website so we can improve the experience.',
    required: false,
    defaultEnabled: true,
    cookies: [
      { name: '_ga', purpose: 'Distinguishes unique visitors (Google Analytics)', duration: '2 years', provider: 'Google Analytics' },
      { name: '_ga_*', purpose: 'Maintains session state (Google Analytics)', duration: '2 years', provider: 'Google Analytics' },
      { name: 'grapsee_anon_id', purpose: 'Anonymous user tracking for analytics', duration: '1 year', provider: 'Grapsee' },
      { name: 'page_views', purpose: 'Tracks page view counts for popular content', duration: '30 days', provider: 'Grapsee' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'Used to track visitors across websites to display relevant advertisements.',
    required: false,
    defaultEnabled: false,
    cookies: [
      { name: '_fbp', purpose: 'Facebook pixel tracking for ad performance', duration: '3 months', provider: 'Meta' },
      { name: '_gcl_au', purpose: 'Google Ads conversion tracking', duration: '3 months', provider: 'Google Ads' },
      { name: 'grapsee_campaign', purpose: 'Tracks which marketing campaign brought you here', duration: '30 days', provider: 'Grapsee' },
    ],
  },
  {
    id: 'personalization',
    name: 'Personalization Cookies',
    description: 'Allow the website to remember choices you make and provide enhanced, personalized features.',
    required: false,
    defaultEnabled: true,
    cookies: [
      { name: 'theme', purpose: 'Remembers your dark/light mode preference', duration: '1 year', provider: 'Grapsee' },
      { name: 'recently_viewed', purpose: 'Shows products you\'ve recently browsed', duration: '30 days', provider: 'Grapsee' },
      { name: 'recommendations', purpose: 'Powers personalized product suggestions', duration: '30 days', provider: 'Grapsee' },
      { name: 'accessibility', purpose: 'Saves your accessibility preferences', duration: '1 year', provider: 'Grapsee' },
    ],
  },
]

const cookiePolicy = {
  lastUpdated: '2025-01-15',
  version: '2.1',
  policyUrl: '/privacy#cookies',
  contactEmail: 'privacy@grapsee.shop',
  sections: [
    {
      title: 'What Are Cookies',
      content: 'Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, understanding how you use our site, and improving our services.',
    },
    {
      title: 'How We Use Cookies',
      content: 'We use cookies to: maintain your session, remember your preferences, analyze site traffic, personalize content and ads, and provide social media features. We categorize our cookies into Essential, Analytics, Marketing, and Personalization.',
    },
    {
      title: 'Third-Party Cookies',
      content: 'Some cookies are placed by third-party services that appear on our pages. We do not control these cookies and recommend reviewing the privacy policies of these third-party providers.',
    },
    {
      title: 'Managing Cookies',
      content: 'You can manage your cookie preferences at any time using the cookie consent tool. You can also control cookies through your browser settings. Note that disabling certain cookies may affect website functionality.',
    },
    {
      title: 'Cookie Duration',
      content: 'Session cookies are deleted when you close your browser. Persistent cookies remain for their specified duration or until manually deleted. We review our cookie practices annually.',
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'guest'

    const savedPrefs = cookiePreferences.get(userId)

    return NextResponse.json({
      success: true,
      categories: cookieCategories,
      policy: cookiePolicy,
      currentPreferences: savedPrefs || {
        userId,
        essential: true,
        analytics: true,
        marketing: false,
        personalization: true,
        acceptedAt: null,
        updatedAt: new Date().toISOString(),
      },
      meta: {
        title: ' Cookie Settings',
        subtitle: 'Manage how we use cookies to improve your experience',
        showBanner: !savedPrefs?.acceptedAt,
        consentVersion: cookiePolicy.version,
      },
    })
  } catch (error) {
    console.error('[COOKIES] GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cookie policy' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, essential, analytics, marketing, personalization, acceptAll } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // If acceptAll is true, enable all categories
    const preferences = {
      userId,
      essential: true, // Always true - required
      analytics: acceptAll ? true : Boolean(analytics),
      marketing: acceptAll ? true : Boolean(marketing),
      personalization: acceptAll ? true : Boolean(personalization),
      acceptedAt: now,
      updatedAt: now,
    }

    cookiePreferences.set(userId, preferences)

    // Determine consent level
    const enabledCount = [preferences.essential, preferences.analytics, preferences.marketing, preferences.personalization]
      .filter(Boolean).length

    let consentLevel = 'minimal'
    if (enabledCount === 4) consentLevel = 'full'
    else if (enabledCount >= 3) consentLevel = 'balanced'
    else if (enabledCount >= 2) consentLevel = 'moderate'

    return NextResponse.json({
      success: true,
      message: 'Cookie preferences saved successfully',
      preferences,
      consentLevel,
      effectiveCookies: cookieCategories
        .filter((cat) => {
          if (cat.id === 'essential') return true
          if (cat.id === 'analytics') return preferences.analytics
          if (cat.id === 'marketing') return preferences.marketing
          if (cat.id === 'personalization') return preferences.personalization
          return false
        })
        .flatMap((cat) => cat.cookies.map((c) => c.name)),
    })
  } catch (error) {
    console.error('[COOKIES] POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save cookie preferences' },
      { status: 500 }
    )
  }
}
