import { NextRequest, NextResponse } from 'next/server'

const blogPosts: Record<string, {
  id: string; slug: string; title: string; excerpt: string; content: string;
  author: string; authorAvatar: string | null; category: string; tags: string[];
  coverImage: string | null; readTime: number; likes: number; featured: boolean;
  createdAt: string;
}> = {}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = blogPosts[slug]

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Get related posts (same category, excluding current)
    const related = Object.values(blogPosts)
      .filter((p) => p.category === post.category && p.slug !== post.slug)
      .slice(0, 3)

    return NextResponse.json({ ...post, related })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
  }
}
