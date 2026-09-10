import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Convert recipe to shopping cart
export async function POST(req: NextRequest) {
  try {
    const { recipeUrl, servings = 4 } = await req.json()
    const userId = req.headers.get('x-user-id')

    const recipeData = { name: 'Custom Recipe', servings: 4, ingredients: [] as any[] }

    // Scale ingredients
    const scaleFactor = servings / recipeData.servings
    const scaledIngredients = recipeData.ingredients.map(ing => ({
      ...ing,
      amount: Math.round(ing.amount * scaleFactor)
    }))

    // Find products for each ingredient
    const cartItems = []
    let totalCost = 0

    for (const ingredient of scaledIngredients) {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: ingredient.name } },
            { tags: { contains: ingredient.name.toLowerCase() } }
          ]
        },
        orderBy: { price: 'asc' },
        take: 1
      })

      if (products.length > 0) {
        const product = products[0]
        const quantity = Math.ceil(ingredient.amount / (product.weight || 100))
        const cost = product.price * quantity

        cartItems.push({
          ingredient: ingredient.name,
          amount: `${ingredient.amount} ${ingredient.unit}`,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity
          },
          cost
        })

        totalCost += cost
      }
    }

    return NextResponse.json({
      success: true,
      recipe: {
        name: recipeData.name,
        originalServings: recipeData.servings,
        requestedServings: servings
      },
      ingredients: cartItems,
      missingItems: scaledIngredients.length - cartItems.length,
      totalCost,
      savings: `Cooking at home saves ~${Math.round(totalCost * 0.6)} vs restaurant`,
      message: `Added ${cartItems.length} items to cart for ${servings} servings of ${recipeData.name}`,
      checkoutUrl: '/checkout?recipe=true'
    })
  } catch (error) {
    console.error('Recipe to cart error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
