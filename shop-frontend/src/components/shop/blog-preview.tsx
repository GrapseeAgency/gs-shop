'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Heart, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'
import { BlogIllustration } from '@/components/events/illustrations'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  author: string
  category: string
  tags: string[]
  readTime: number
  likes: number
  featured: boolean
  coverImage: string | null
  createdAt: string
}

const categoryColors: Record<string, string> = {
  tips: 'bg-emerald-500/10 text-emerald-600',
  news: 'bg-sky-500/10 text-sky-600',
  reviews: 'bg-violet-500/10 text-violet-600',
  guides: 'bg-amber-500/10 text-amber-600',
  lifestyle: 'bg-pink-500/10 text-pink-600',
}

const categoryGradients: Record<string, string> = {
  tips: 'from-emerald-400 to-teal-500',
  news: 'from-sky-400 to-blue-500',
  reviews: 'from-violet-400 to-purple-500',
  guides: 'from-amber-400 to-orange-500',
  lifestyle: 'from-pink-400 to-rose-500',
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function BlogPreview() {
  const { goBlog, goBlogPost } = useShopRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/blogs?limit=2')
        if (res.ok) {
          const data = await res.json()
          const items: BlogPost[] = data.data || data
          setPosts(items.slice(0, 2))
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <section className="px-4 py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">From Our Blog</h2>
            <p className="text-[11px] text-muted-foreground">Tips, news &amp; insights</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goBlog()}
          className="gap-1 text-xs font-medium text-primary hover:text-primary/80"
        >
          Read More
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Blog Illustration Banner */}
      <div className="mb-3 h-[120px] rounded-2xl overflow-hidden shadow-md">
        <BlogIllustration />
      </div>

      {/* Blog post cards */}
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-xl bg-muted"
              />
            ))
          : posts.map((post, i) => {
              const gradient = categoryGradients[post.category] || 'from-gray-400 to-gray-500'
              const badgeColor = categoryColors[post.category] || 'bg-glass-very-light0/10 text-gray-600'

              return (
                <motion.button
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  onClick={() => goBlogPost(post.slug)}
                  className="group w-full overflow-hidden rounded-xl border border-border/50 bg-card text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-36">
                    {/* Image / Gradient placeholder */}
                    <div className={`relative w-28 flex-shrink-0 bg-gradient-to-br ${gradient}`}>
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between p-3">
                      <div>
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${badgeColor}`}>
                            {post.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {post.readTime}m
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Heart className="h-3 w-3" />
                            {post.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
      </div>
    </section>
  )
}

