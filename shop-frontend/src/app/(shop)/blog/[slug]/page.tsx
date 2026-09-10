'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, BookOpen, Clock, Heart, User, Tag,
  Share2, ChevronRight, Facebook, Twitter, Copy, CheckCheck, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

interface RelatedPost {
  id: string
  slug: string
  title: string
  excerpt: string
  readTime: number
  coverImage: string | null
  category: string
}

interface BlogPostData {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  authorAvatar: string | null
  category: string
  tags: string[]
  coverImage: string | null
  readTime: number
  likes: number
  createdAt: string
  related: RelatedPost[]
}

export default function BlogPostDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { goBack } = useShopRouter()
  const router = useRouter()
  const [post, setPost] = useState<BlogPostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [copied, setCopied] = useState(false)

  const fetchPost = useCallback(async () => {
    if (!slug) return
    try {
      const res = await fetch(`/api/blogs/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setPost(data)
        setLikeCount(data.likes)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetchPost() }, [fetchPost])

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount((c) => liked ? c - 1 : c + 1)
    if (!liked) toast.success('Liked! ')
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href })
      } catch { /* user cancelled */ }
    } else {
      handleShare()
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center py-16 text-center px-4">
        <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm font-medium text-foreground">Article not found</p>
        <Button variant="outline" onClick={goBack} className="mt-4">Go Back</Button>
      </div>
    )
  }

  // Simple markdown-ish rendering
  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, i) => {
      if (paragraph.startsWith('## ')) {
        return <h2 key={i} className="text-base font-bold text-foreground mt-6 mb-2">{paragraph.replace('## ', '')}</h2>
      }
      if (paragraph.startsWith('- ')) {
        return (
          <ul key={i} className="space-y-1 ml-4 list-disc text-muted-foreground">
            {paragraph.split('\n').map((line, j) => (
              <li key={j} className="text-sm" dangerouslySetInnerHTML={{ __html: line.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
            ))}
          </ul>
        )
      }
      if (/^\d+\./.test(paragraph)) {
        return (
          <ol key={i} className="space-y-1 ml-4 list-decimal text-muted-foreground">
            {paragraph.split('\n').map((line, j) => (
              <li key={j} className="text-sm" dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
            ))}
          </ol>
        )
      }
      return <p key={i} className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
    })
  }

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
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground line-clamp-1">Article</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleNativeShare} className="text-muted-foreground hover:text-foreground">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-border/50">
        <div className="relative h-44 flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-violet-500/5">
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
          ) : (
            <BookOpen className="h-12 w-12 text-violet-400 opacity-30" />
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="px-4 mt-4">
        {/* Category & Meta */}
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </Badge>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> {post.readTime} min read
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-foreground mb-3 leading-tight">{post.title}</h1>

        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20">
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt={post.author} className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-violet-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{post.author}</p>
            <p className="text-[10px] text-muted-foreground">Contributing Writer</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${liked ? 'text-rose-400' : 'text-muted-foreground'}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-rose-400' : ''}`} />
              <span className="text-xs">{likeCount}</span>
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Article Body */}
        <article className="prose-sm max-w-none">
          {renderContent(post.content)}
        </article>

        <Separator className="my-4" />

        {/* Tags */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Tag className="h-3 w-3" /> Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">#{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Share2 className="h-3 w-3" /> Share
          </h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleNativeShare}>
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleShare}>
              {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Related Posts */}
        {post.related && post.related.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-bold text-foreground">Related Articles</h3>
            <div className="space-y-2">
              {post.related.map((related) => (
                <motion.button
                  key={related.id}
                  className="group w-full flex items-center gap-3 rounded-xl border border-border/30 bg-card p-3 text-left"
                  onClick={() => router.push(`/blog/${related.slug}`)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    <BookOpen className="h-5 w-5 text-primary/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {related.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground">{related.readTime} min read</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
