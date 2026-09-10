import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { products } = await req.json()

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 })
    }

    const results = {
      created: 0,
      failed: [] as any[]
    }

    // Process each product
    for (const product of products) {
      try {
        // Validate required fields
        if (!product.name || !product.price || !product.categoryId) {
          results.failed.push({
            product: product.name || 'Unknown',
            reason: 'Missing required fields (name, price, categoryId)'
          })
          continue
        }

        // Create slug
        const slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

        // Check for duplicate
        const existing = await prisma.product.findUnique({
          where: { slug }
        })

        if (existing) {
          results.failed.push({
            product: product.name,
            reason: 'Product with similar name already exists'
          })
          continue
        }

        // Create product
        await prisma.product.create({
          data: {
            name: product.name,
            slug,
            description: product.description || '',
            price: parseFloat(product.price),
            comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl || null,
            features: product.features ? JSON.stringify(product.features) : null,
            techStack: product.techStack ? JSON.stringify(product.techStack) : null,
            deliveryTime: product.deliveryTime || '14 days',
            isFeatured: product.isFeatured || false,
            isActive: true
          }
        })

        results.created++
      } catch (error) {
        results.failed.push({
          product: product.name || 'Unknown',
          reason: 'Error creating product'
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `${results.created} products created, ${results.failed.length} failed`
    })
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 })
  }
}

// Template for CSV upload
export async function GET(req: NextRequest) {
  const template = [
    {
      name: 'Example Product',
      description: 'Product description here',
      price: 99.99,
      comparePrice: 149.99,
      categoryId: 'category-id-here',
      imageUrl: 'https://example.com/image.jpg',
      features: '["Feature 1", "Feature 2"]',
      techStack: '["React", "Node.js"]',
      deliveryTime: '14 days',
      isFeatured: false
    }
  ]

  return NextResponse.json({
    template,
    instructions: 'Upload a CSV or JSON file with the following columns: name, description, price, comparePrice, categoryId, imageUrl, features, techStack, deliveryTime, isFeatured'
  })
}
