import { NextRequest, NextResponse } from 'next/server'

const blogPosts: any[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  let filtered = [...blogPosts]

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category === category)
  }

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  return NextResponse.json({ data: filtered })
}
