import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'productId query parameter is required' },
        { status: 400 }
      )
    }

    const questions = await prisma.productQuestion.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: questions })
  } catch (error) {
    console.error('[PRODUCT_QUESTIONS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch product questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, author, question } = body

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      )
    }

    if (!author || typeof author !== 'string' || !author.trim()) {
      return NextResponse.json(
        { error: 'Author name is required' },
        { status: 400 }
      )
    }

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const productQuestion = await prisma.productQuestion.create({
      data: {
        productId,
        author: author.trim(),
        question: question.trim(),
      },
    })

    return NextResponse.json({ data: productQuestion }, { status: 201 })
  } catch (error) {
    console.error('[PRODUCT_QUESTIONS_POST]', error)
    return NextResponse.json(
      { error: 'Failed to create product question' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, answer, answeredBy } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Question id is required' },
        { status: 400 }
      )
    }

    if (!answer || typeof answer !== 'string' || !answer.trim()) {
      return NextResponse.json(
        { error: 'Answer is required' },
        { status: 400 }
      )
    }

    if (!answeredBy || typeof answeredBy !== 'string' || !answeredBy.trim()) {
      return NextResponse.json(
        { error: 'Answered by name is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.productQuestion.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.productQuestion.update({
      where: { id },
      data: {
        answer: answer.trim(),
        answeredBy: answeredBy.trim(),
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('[PRODUCT_QUESTIONS_PUT]', error)
    return NextResponse.json(
      { error: 'Failed to answer product question' },
      { status: 500 }
    )
  }
}
