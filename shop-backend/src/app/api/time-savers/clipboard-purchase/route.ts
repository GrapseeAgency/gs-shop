import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Detect clipboard content and suggest purchase
export async function POST(req: NextRequest) {
  try {
    const { clipboardText, userId } = await req.json()

    if (!clipboardText) {
      return NextResponse.json({ detected: false })
    }

    // Check if clipboard contains product-like text
    const productKeywords = ['buy', 'price', 'amazon', 'flipkart', 'product', '', 'rs']
    const isProductRelated = productKeywords.some(kw => 
      clipboardText.toLowerCase().includes(kw.toLowerCase())
    )

    if (!isProductRelated) {
      return NextResponse.json({ detected: false })
    }

    // Try to extract product name
    const cleanedText = clipboardText
      .replace(/[\d,]+/g, '') // Remove prices
      .replace(/https?:\/\/\S+/g, '') // Remove URLs
      .replace(/\d+\s*(g|kg|ml|l|pcs|pieces)/gi, '') // Remove quantities
      .trim()

    // Search for product
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: cleanedText.slice(0, 50) } },
          { description: { contains: cleanedText.slice(0, 50) } }
        ]
      },
      take: 3
    })

    if (products.length === 0) {
      return NextResponse.json({
        detected: true,
        productName: cleanedText.slice(0, 50),
        found: false,
        message: `We noticed you copied "${cleanedText.slice(0, 30)}...". Search for it?`,
        searchUrl: `/search?q=${encodeURIComponent(cleanedText.slice(0, 50))}`
      })
    }

    const bestMatch = products[0]

    return NextResponse.json({
      detected: true,
      found: true,
      product: {
        id: bestMatch.id,
        name: bestMatch.name,
        price: bestMatch.price,
        imageUrl: bestMatch.imageUrl
      },
      alternatives: products.slice(1),
      message: `Buy "${bestMatch.name}" for ${bestMatch.price}?`,
      quickBuyUrl: `/checkout?product=${bestMatch.id}`,
      notification: {
        title: 'Product Detected!',
        body: `${bestMatch.name} - ${bestMatch.price}`,
        action: 'Buy Now'
      }
    })
  } catch (error) {
    console.error('Clipboard detection error:', error)
    return NextResponse.json({ detected: false })
  }
}
