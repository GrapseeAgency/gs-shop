'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, BookOpen, Search, Clock, Heart, User,
  Tag, Flame, Sparkles, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useRouter } from 'next/navigation'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  author: string
  authorAvatar: string | null
  category: string
  tags: string[]
  coverImage: string | null
  readTime: number
  likes: number
  featured: boolean
  createdAt: string
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  tips: { label: 'Tips', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  news: { label: 'News', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  reviews: { label: 'Reviews', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  guides: { label: 'Guides', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  lifestyle: { label: 'Lifestyle', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
}

export default function BlogPage() {
  const { goBack } = useShopRouter()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') params.set('category', activeTab)
      if (searchQuery) params.set('search', searchQuery)
      const res = await fetch(`/api/blogs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data.data || [])
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [activeTab, searchQuery])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const featuredPost = posts.find((p) => p.featured)
  const regularPosts = posts.filter((p) => !p.featured)

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'tips', label: 'Tips' },
    { key: 'news', label: 'News' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'guides', label: 'Guides' },
    { key: 'lifestyle', label: 'Lifestyle' },
  ]

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-400" />
              Blog & Magazine
            </h1>
            <p className="text-[11px] text-muted-foreground">Insights, tips & stories</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mx-4 mt-3 flex gap-1.5 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => { setActiveTab(tab.key); setLoading(true) }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Featured Post */}
      {featuredPost && !searchQuery && activeTab === 'all' && (
        <div className="px-4 mt-4">
          <motion.button
            className="group w-full overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent text-left"
            onClick={() => router.push(`/blog/${featuredPost.slug}`)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative h-40 flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-violet-500/5">
              {featuredPost.coverImage ? (
                <img src={featuredPost.coverImage} alt={featuredPost.title} className="h-full w-full object-cover" />
              ) : (
                <Flame className="h-12 w-12 text-violet-400 opacity-30" />
              )}
              <Badge className="absolute left-3 top-3 bg-violet-500/90 text-white text-[9px]">
                <Sparkles className="mr-1 h-3 w-3" /> Featured
              </Badge>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-[9px] ${CATEGORY_CONFIG[featuredPost.category]?.color || 'bg-muted text-muted-foreground'}`}>
                  {CATEGORY_CONFIG[featuredPost.category]?.label || featuredPost.category}
                </Badge>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {featuredPost.readTime} min read
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{featuredPost.excerpt}</p>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20">
                  <User className="h-3 w-3 text-violet-400" />
                </div>
                <span className="text-[11px] font-medium text-foreground">{featuredPost.author}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(featuredPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Heart className="h-3 w-3" /> {featuredPost.likes}
                </span>
              </div>
            </div>
          </motion.button>
        </div>
      )}

      {/* Regular Posts */}
      <div className="px-4 mt-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">
          {searchQuery ? 'Search Results' : activeTab !== 'all' ? `${CATEGORY_CONFIG[activeTab]?.label || activeTab} Articles` : 'Latest Articles'}
        </h3>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))
        ) : regularPosts.length === 0 && !featuredPost ? (
          <div className="flex flex-col items-center py-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No articles found</p>
            <p className="text-xs text-muted-foreground">Try a different search or category</p>
          </div>
        ) : (
          regularPosts.map((post, index) => {
            const catConfig = CATEGORY_CONFIG[post.category] || { label: post.category, color: 'bg-muted text-muted-foreground border-border' }
            return (
              <motion.button
                key={post.id}
                className="group w-full flex gap-3 rounded-2xl border border-border/50 bg-card p-3 text-left transition-all hover:border-primary/20 hover:shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/blog/${post.slug}`)}
              >
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-primary/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge className={`text-[8px] px-1.5 py-0 ${catConfig.color}`}>{catConfig.label}</Badge>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />{post.readTime}m
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{post.author}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </motion.button>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
