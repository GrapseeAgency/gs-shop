import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Track child growth and suggest sizes
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { childName, age, height, weight, currentSize } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Save growth data
    await prisma.childProfile.create({
      data: {
        userId,
        name: childName,
        age,
        height,
        weight,
        currentSize,
        recordedAt: new Date()
      }
    }).catch(() => {})

    // Predict next size
    const predictedSize = predictNextSize(age, currentSize)
    
    // Calculate growth trajectory
    const growthRate = age < 2 ? 'rapid' : age < 5 ? 'steady' : 'slow'

    // Find appropriate products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { tags: { contains: `size-${predictedSize.toLowerCase()}` } },
          { tags: { contains: 'kids' } },
          { tags: { contains: 'children' } },
          { category: { name: { contains: 'kids' } } }
        ]
      },
      take: 8
    })

    return NextResponse.json({
      child: {
        name: childName,
        age,
        currentSize,
        predictedNextSize: predictedSize,
        growthRate
      },
      recommendations: {
        buyNow: currentSize,
        prepareFor: predictedSize,
        message: `At ${age} years, children typically grow into ${predictedSize} in ${growthRate === 'rapid' ? '2-3' : '4-6'} months.`
      },
      products,
      tip: growthRate === 'rapid' 
        ? 'Stock up on next size early - they grow fast!'
        : 'Buy current size with some room to grow.'
    })
  } catch (error) {
    console.error('Child growth error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function predictNextSize(age: number, currentSize: string): string {
  const sizes = ['0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', 
                 '2T', '3T', '4T', '5T', 'XS', 'S', 'M', 'L']
  
  const currentIndex = sizes.indexOf(currentSize)
  if (currentIndex >= 0 && currentIndex < sizes.length - 1) {
    return sizes[currentIndex + 1]
  }
  
  // Age-based fallback
  if (age < 1) return '12-18M'
  if (age < 2) return '2T'
  if (age < 3) return '3T'
  if (age < 4) return '4T'
  if (age < 5) return '5T'
  return 'XS'
}
