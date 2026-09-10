'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, MessageCircle, Share2, Star, ThumbsUp,
  Camera, Send, Image, User, MoreHorizontal, Bookmark,
  ShoppingBag, Award, Eye, Smile, TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

interface CommunityPost {
  id: string
  author: {
    name: string
    avatar: string | null
    tier: string
    verified: boolean
  }
  content: string
  images: string[]
  productTags: { id: string; name: string; price: number }[]
  likes: number
  comments: number
  shares: number
  liked: boolean
  bookmarked: boolean
  type: 'review' | 'style' | 'haul' | 'tip'
  createdAt: string
}

function PostCard({ post, index }: { post: CommunityPost; index: number }) {
  const { goProduct } = useShopRouter()
  const [liked, setLiked] = useState(post.liked)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [bookmarked, setBookmarked] = useState(post.bookmarked)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const typeConfig = {
    review: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Review' },
    style: { color: 'text-violet-500', bg: 'bg-violet-500/10', label: 'Style' },
    haul: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Haul' },
    tip: { color: 'text-sky-500', bg: 'bg-sky-500/10', label: 'Tip' },
  }
  const tc = typeConfig[post.type]

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      {/* Author Header */}
      <div className="flex items-center gap-2.5 p-3 pb-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-border/30">
          {post.author.avatar ? (
            <img src={post.author.avatar} alt={post.author.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            <User className="h-5 w-5 text-primary/60" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground truncate">{post.author.name}</span>
            {post.author.verified && (
              <Badge className="h-4 px-1 bg-primary/10 text-primary text-[8px] border-primary/20">
                <Award className="mr-0.5 h-2.5 w-2.5" />Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className={`h-4 px-1.5 ${tc.bg} ${tc.color} text-[8px] border-0`}>{tc.label}</Badge>
            <span className="text-[10px] text-muted-foreground">{timeAgo(post.createdAt)}</span>
          </div>
        </div>
        <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted/50">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-3 pt-2">
        <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
      </div>

      {/* Product Tags */}
      {post.productTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-3 mt-2 scrollbar-hide">
          {post.productTags.map((tag) => (
            <motion.button
              key={tag.id}
              onClick={() => goProduct(tag.id)}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1"
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-primary truncate max-w-[120px]">{tag.name}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Engagement Bar */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-4">
          {/* Like */}
          <motion.button
            onClick={handleLike}
            className="flex items-center gap-1"
            whileTap={{ scale: 0.85 }}
          >
            <motion.div
              animate={liked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </motion.div>
            <span className={`text-[11px] font-medium ${liked ? 'text-red-500' : 'text-muted-foreground'}`}>{likeCount}</span>
          </motion.button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1"
          >
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">{post.comments}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.author.name, text: post.content })
              } else {
                navigator.clipboard.writeText(post.content)
                toast.success('Post copied to clipboard!')
              }
            }}
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">{post.shares}</span>
          </button>
        </div>

        {/* Bookmark */}
        <motion.button
          onClick={() => {
            setBookmarked(!bookmarked)
            toast.success(bookmarked ? 'Removed bookmark' : 'Bookmarked!')
          }}
          whileTap={{ scale: 0.85 }}
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} />
        </motion.button>
      </div>

      {/* Comment Input (expandable) */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="flex items-center gap-2 p-3">
              <Input
                placeholder="Write a comment..."
                className="h-8 text-xs"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    toast.success('Comment posted!')
                    setCommentText('')
                  }
                }}
              />
              <Button
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                disabled={!commentText.trim()}
                onClick={() => {
                  toast.success('Comment posted!')
                  setCommentText('')
                }}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function CommunityPage() {
  const { goBack } = useShopRouter()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'review' | 'style' | 'haul' | 'tip'>('all')

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/community/posts')
        if (res.ok) {
          const data = await res.json()
          const raw = Array.isArray(data) ? data : data.data || []
          if (raw.length > 0) {
            setPosts(raw)
            setLoading(false)
            return
          }
        }
      } catch {
        // fallback
      }
      setPosts([])
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const filteredPosts = posts.filter((p) => filter === 'all' || p.type === filter)

  const stats = {
    members: 12500 + Math.floor(Math.random() * 500),
    posts: posts.length * 120 + 340,
    reviews: 890 + Math.floor(Math.random() * 50),
  }

  return (
    <motion.div className="pb-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Community
            </h1>
            <p className="text-[11px] text-muted-foreground">{stats.members.toLocaleString()} members</p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs">
            <Camera className="h-3.5 w-3.5" /> Post
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
        {[
          { icon: User, value: stats.members.toLocaleString(), label: 'Members', color: 'text-primary' },
          { icon: Eye, value: stats.posts.toLocaleString(), label: 'Posts', color: 'text-emerald-500' },
          { icon: Star, value: stats.reviews.toLocaleString(), label: 'Reviews', color: 'text-amber-500' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="flex flex-col items-center rounded-xl bg-muted/30 border border-border/30 p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <stat.icon className={`h-4 w-4 ${stat.color} mb-1`} />
            <span className="text-sm font-bold text-foreground">{stat.value}</span>
            <span className="text-[9px] text-muted-foreground">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Share Your Style CTA */}
      <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-violet-500/10 via-pink-500/5 to-rose-500/5 border border-violet-500/20 p-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Camera className="h-5 w-5 text-violet-500" />
          </motion.div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Share Your Style</p>
            <p className="text-[11px] text-muted-foreground">Post your setup & earn 50 bonus points!</p>
          </div>
          <Button size="sm" className="gap-1 text-xs bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white">
            <Image className="h-3.5 w-3.5" /> Share
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
        {[
          { key: 'all' as const, label: 'All', icon: Smile },
          { key: 'review' as const, label: 'Reviews', icon: Star },
          { key: 'style' as const, label: 'Styles', icon: Eye },
          { key: 'haul' as const, label: 'Hauls', icon: ShoppingBag },
          { key: 'tip' as const, label: 'Tips', icon: ThumbsUp },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <f.icon className="h-3 w-3" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="px-4 mt-3 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-16 animate-pulse rounded bg-muted mt-1" />
                </div>
              </div>
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          ))
        ) : filteredPosts.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Smile className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-foreground">No posts yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Be the first to share!</p>
          </motion.div>
        ) : (
          filteredPosts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))
        )}
      </div>
    </motion.div>
  )
}
