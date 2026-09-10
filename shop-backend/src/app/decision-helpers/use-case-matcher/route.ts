import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Match products to use case
export async function POST(req: NextRequest) {
  try {
    const { category, useCase } = await req.json()

    // Use case keywords
    const useCaseKeywords: Record<string, string[]> = {
      'coding': ['programming', 'development', 'laptop', 'keyboard', 'monitor'],
      'gaming': ['gaming', 'gpu', 'high refresh', 'rgb', 'performance'],
      'editing': ['editing', 'creative', 'color accurate', 'mac', 'display'],
      'office': ['office', 'productivity', 'battery life', 'lightweight'],
      'student': ['student', 'budget', 'portable', 'durable']
    }

    const keywords = useCaseKeywords[useCase.toLowerCase()] || []

    // Find matching products
    const products = await prisma.product.findMany({
      where: {
        category: { name: { contains: category } },
        isActive: true,
        OR: keywords.map(k => ({
          OR: [
            { name: { contains: k } },
            { description: { contains: k } },
            { tags: { contains: k } }
          ]
        }))
      },
      take: 10
    })

    // Score by match
    const scored = products.map(p => {
      let score = 0
      keywords.forEach(k => {
        if (p.name.toLowerCase().includes(k)) score += 10
        if (p.description?.toLowerCase().includes(k)) score += 5
        if (p.tags?.includes(k)) score += 8
      })
      return { ...p, matchScore: score }
    }).sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({
      useCase,
      category,
      matches: scored.slice(0, 5),
      topPick: scored[0],
      reasoning: `Top pick scored ${scored[0]?.matchScore} based on ${useCase} keywords`,
      alternatives: scored.slice(1, 4),
      why: `For ${useCase}, look for: ${keywords.join(', ')}`
    })
  } catch (error) {
    console.error('Use case matcher error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
