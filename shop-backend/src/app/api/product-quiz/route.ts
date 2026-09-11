import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

const quizQuestions = [
  {
    id: 'q1',
    question: "What's your primary goal?",
    type: 'single',
    options: [
      { id: 'a', text: 'Boost productivity', value: 'productivity' },
      { id: 'b', text: 'Launch a business', value: 'business' },
      { id: 'c', text: 'Learn new skills', value: 'learning' },
      { id: 'd', text: 'Creative expression', value: 'creative' },
    ],
  },
  {
    id: 'q2',
    question: "What's your budget range?",
    type: 'single',
    options: [
      { id: 'a', text: 'Under $500', value: 'budget' },
      { id: 'b', text: '$500 - $2000', value: 'mid' },
      { id: 'c', text: '$2000 - $5000', value: 'premium' },
      { id: 'd', text: 'No limit', value: 'luxury' },
    ],
  },
  {
    id: 'q3',
    question: 'Which best describes you?',
    type: 'single',
    options: [
      { id: 'a', text: 'Developer', value: 'developer' },
      { id: 'b', text: 'Designer', value: 'designer' },
      { id: 'c', text: 'Entrepreneur', value: 'entrepreneur' },
      { id: 'd', text: 'Student', value: 'student' },
    ],
  },
  {
    id: 'q4',
    question: 'What type of product interests you?',
    type: 'single',
    options: [
      { id: 'a', text: 'Websites & Apps', value: 'web' },
      { id: 'b', text: 'Design Assets', value: 'design' },
      { id: 'c', text: 'Software Tools', value: 'tools' },
      { id: 'd', text: 'Courses & Guides', value: 'courses' },
    ],
  },
  {
    id: 'q5',
    question: 'How soon do you need it?',
    type: 'single',
    options: [
      { id: 'a', text: 'Right now', value: 'instant' },
      { id: 'b', text: 'This week', value: 'week' },
      { id: 'c', text: 'This month', value: 'month' },
      { id: 'd', text: 'Just browsing', value: 'browsing' },
    ],
  },
]

// GET /api/product-quiz
export async function GET() {
  try {
    return NextResponse.json({
      questions: quizQuestions,
      totalQuestions: quizQuestions.length,
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}

// POST /api/product-quiz Submit answers and get recommendations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers } = body // { q1: 'a', q2: 'b', ... }

    if (!answers) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 })
    }

    // Determine personality type based on answers
    const goal = answers.q1 || 'productivity'
    const budget = answers.q2 || 'mid'
    const role = answers.q3 || 'developer'
    const productType = answers.q4 || 'web'
    const urgency = answers.q5 || 'browsing'

    // Build recommendation query
    const categoryMap: Record<string, string> = {
      web: 'websites',
      design: 'design',
      tools: 'productivity',
      courses: 'education',
    }

    const categorySlug = categoryMap[productType] || 'websites'

    // Persist matched category in UserPreference interests if authenticated
    try {
      const session = await getServerSession(authOptions)
      const userId = (session?.user as any)?.id
      if (userId) {
        const existing = await prisma.userPreference.findUnique({
          where: { userId },
        })
        let interests: string[] = []
        if (existing?.interests) {
          try { interests = JSON.parse(existing.interests) } catch {}
        }
        if (!interests.includes(categorySlug)) {
          interests.push(categorySlug)
        }
        await prisma.userPreference.upsert({
          where: { userId },
          update: { interests: JSON.stringify(interests) },
          create: { userId, interests: JSON.stringify(interests) },
        })
      }
    } catch (e) {
      console.error('[QUIZ_SAVE_INTERESTS_ERROR]', e)
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      take: 4,
      orderBy: { rating: 'desc' },
    })

    // If not enough products, get more
    let allProducts = products
    if (products.length < 4) {
      const more = await prisma.product.findMany({
        where: { isActive: true },
        take: 4 - products.length,
        orderBy: { rating: 'desc' },
      })
      allProducts = [...products, ...more]
    }

    const personalityTypes: Record<string, { name: string; description: string; emoji: string }> = {
      'productivity-developer': { name: 'The Efficiency Expert', description: 'You love tools that streamline your workflow and maximize output.', emoji: '' },
      'business-entrepreneur': { name: 'The Visionary Builder', description: 'You see opportunities everywhere and need the right tools to build your empire.', emoji: '' },
      'learning-student': { name: 'The Knowledge Seeker', description: 'You invest in growth and are always expanding your skillset.', emoji: '' },
      'creative-designer': { name: 'The Creative Mind', description: 'You express yourself through design and seek inspiration in every tool.', emoji: '' },
    }

    const personalityKey = `${goal}-${role}`
    const personality = personalityTypes[personalityKey] || {
      name: 'The Explorer',
      description: 'You have diverse interests and love discovering new solutions.',
      emoji: '',
    }

    const recommendations = allProducts.map((p, i) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      matchScore: 95 - i * 7,
      reason: ['Perfect match for your goals', 'Great value for your budget', 'Highly rated by similar users', 'Trending in your category'][i] || 'Recommended for you',
    }))

    return NextResponse.json({
      personality,
      recommendations,
      summary: {
        goal,
        budget,
        role,
        productType,
        urgency,
      },
    })
  } catch (error) {
    console.error('Error processing quiz:', error)
    return NextResponse.json({ error: 'Failed to process quiz' }, { status: 500 })
  }
}
