import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Match recipes with available ingredients/products
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { ingredients, dietary, cuisine } = await req.json()

    // Find products matching ingredients
    const matchedProducts = []
    const missingIngredients = []

    for (const ingredient of ingredients) {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: ingredient,  } },
            { tags: { contains: ingredient.toLowerCase() } }
          ]
        },
        take: 3
      })

      if (products.length > 0) {
        matchedProducts.push({
          ingredient,
          products: products.slice(0, 2)
        })
      } else {
        missingIngredients.push(ingredient)
      }
    }

    // Calculate coverage
    const coverage = Math.round((matchedProducts.length / ingredients.length) * 100)

    // Get recipe suggestions based on matched ingredients
    const recipes = generateRecipeIdeas(matchedProducts.map(m => m.ingredient), cuisine)

    return NextResponse.json({
      ingredients,
      matchedProducts,
      missingIngredients,
      coverage,
      canMakeRecipe: coverage >= 70,
      recipes,
      addToCartUrl: '/checkout?recipe=true',
      message: coverage >= 70
        ? 'You have most ingredients! Ready to cook.'
        : `You have ${coverage}% of ingredients. Missing items added to suggestions.`
    })
  } catch (error) {
    console.error('Recipe matcher error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get popular recipes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dietary = searchParams.get('dietary')
    const cuisine = searchParams.get('cuisine')

    const recipes = generatePopularRecipes(dietary, cuisine)

    return NextResponse.json({
      recipes,
      filters: { dietary, cuisine },
      total: recipes.length
    })
  } catch (error) {
    console.error('Recipes error:', error)
    return NextResponse.json({ recipes: [] })
  }
}

function generateRecipeIdeas(ingredients: string[], cuisine?: string) {
  return [
    {
      name: `${cuisine || 'Quick'} ${ingredients[0]} Dish`,
      difficulty: 'Easy',
      time: '20 mins',
      ingredients: ingredients.slice(0, 4)
    },
    {
      name: `${ingredients[0]} & ${ingredients[1] || 'Rice'} Bowl`,
      difficulty: 'Medium',
      time: '30 mins',
      ingredients: ingredients.slice(0, 5)
    }
  ]
}

function generatePopularRecipes(dietary?: string | null, cuisine?: string | null) {
  const base = [
    { name: 'One-Pan Chicken Dinner', difficulty: 'Easy', time: '25 mins', tags: ['quick', 'healthy'] },
    { name: 'Vegetable Stir Fry', difficulty: 'Easy', time: '15 mins', tags: ['vegetarian', 'quick'] },
    { name: 'Pasta Primavera', difficulty: 'Medium', time: '30 mins', tags: ['vegetarian', 'italian'] },
    { name: 'Quinoa Bowl', difficulty: 'Easy', time: '20 mins', tags: ['healthy', 'vegan'] },
    { name: 'Curry Rice', difficulty: 'Medium', time: '35 mins', tags: ['indian', 'spicy'] }
  ]

  if (dietary) {
    return base.filter(r => r.tags.includes(dietary.toLowerCase()))
  }

  if (cuisine) {
    return base.filter(r => r.tags.includes(cuisine.toLowerCase()))
  }

  return base
}
