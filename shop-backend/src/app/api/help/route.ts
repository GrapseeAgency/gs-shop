import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const popular = searchParams.get('popular') === 'true'

    // Get help categories with their articles
    const whereClause: any = {}
    if (category && category !== 'all') {
      whereClause.category = category
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { category: { contains: search } },
      ]
    }

    const helpArticles = await prisma.helpArticle.findMany({
      where: whereClause,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: popular ? 10 : undefined,
    })

    // Group articles by category
    const categoriesMap = new Map()
    helpArticles.forEach(article => {
      if (!categoriesMap.has(article.category)) {
        categoriesMap.set(article.category, {
          id: article.category.toLowerCase().replace(/\s+/g, '-'),
          title: article.category,
          icon: getCategoryIcon(article.category),
          description: getCategoryDescription(article.category),
          articles: []
        })
      }
      categoriesMap.get(article.category).articles.push({
        id: article.id,
        title: article.title,
        content: article.content,
        featured: article.featured,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      })
    })

    const categories = Array.from(categoriesMap.values())

    // Get popular articles
    const popularArticles = await prisma.helpArticle.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        featured: true
      }
    })

    // If no articles exist, create default help articles
    if (helpArticles.length === 0) {
      await createDefaultHelpArticles()
      return await GET(request) // Recursive call to fetch created articles
    }

    return NextResponse.json({
      success: true,
      categories,
      popularArticles: popularArticles.map(article => ({
        id: article.id,
        title: article.title,
      })),
      total: helpArticles.length
    })
  } catch (error) {
    console.error('Error fetching help articles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch help articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      category,
      featured = false,
      authorId,
    } = body

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, content, and category required' },
        { status: 400 }
      )
    }

    // Verify author exists and is authorized
    if (authorId) {
      const author = await prisma.user.findUnique({
        where: { id: authorId },
        select: { id: true, role: true }
      })

      if (!author || !['admin', 'editor', 'support'].includes(author.role || '')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized to create help articles' },
          { status: 403 }
        )
      }
    }

    const helpArticle = await prisma.helpArticle.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        content,
        category,
        featured: featured || false
      },
    })

    return NextResponse.json({
      success: true,
      data: helpArticle,
      message: 'Help article created successfully',
    })
  } catch (error) {
    console.error('Error creating help article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create help article' },
      { status: 500 }
    )
  }
}

// Helper functions
function getCategoryIcon(category: string): string {
  const iconMap: { [key: string]: string } = {
    'Orders': 'package',
    'Shipping': 'truck',
    'Returns': 'rotate-ccw',
    'Payments': 'credit-card',
    'Account': 'user',
    'Products': 'shopping-bag',
    'Technical': 'settings',
    'Billing': 'file-text',
    'Security': 'shield',
    'Legal': 'gavel'
  }
  return iconMap[category] || 'help-circle'
}

function getCategoryDescription(category: string): string {
  const descMap: { [key: string]: string } = {
    'Orders': 'Track, modify, or cancel your orders',
    'Shipping': 'Delivery options and timelines',
    'Returns': 'Return policy and refund process',
    'Payments': 'Payment methods and billing',
    'Account': 'Manage your profile and settings',
    'Products': 'Product info and comparisons',
    'Technical': 'Technical support and troubleshooting',
    'Billing': 'Invoicing and billing questions',
    'Security': 'Security and privacy concerns',
    'Legal': 'Terms, policies, and legal information'
  }
  return descMap[category] || 'Help and support information'
}

async function createDefaultHelpArticles() {
  const defaultArticles = [
    {
      title: 'How to track my order?',
      content: 'Go to Orders page and click on any order to see real-time tracking status. You can also use the tracking number in shipping confirmation email.',
        featured: true
    },
    {
      title: 'What is the return policy?',
      content: 'Physical items: 30-day return window. Digital services: Satisfaction guarantee with full refund within 7 days if requirements are not met.',
        featured: true
    },
    {
      title: 'What payment methods are accepted?',
      content: 'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay, and Grapsee Wallet. Crypto payments coming soon.',
        featured: true
    },
    {
      title: 'How to apply a discount code?',
      content: 'Enter your discount code at checkout in the "Promo Code" field. The discount will be applied before payment. Only one code per order.',
        featured: false
    },
    {
      title: 'How to reset my password?',
      content: 'Go to Settings > Account > Change Password. You can also use "Forgot Password" on the login screen to reset via email.',
        featured: false
    }
  ]

  await Promise.all(
    defaultArticles.map(article =>
      prisma.helpArticle.create({
        data: {
          ...article,
          slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          category: 'general'
        }
      })
    )
  )
}
