'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, MessageCircle, Share2,
  Camera, Send, User, MoreHorizontal, Bookmark,
  ShoppingBag, Award, TrendingUp, X, ImagePlus,
  Loader2, Smile, Trash2, LogIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { CommunityIllustration } from '@/components/events/illustrations'

interface Post {
  id: string
  author: string
  avatar: string | null
  userId: string | null
  content: string
  images: string[]
  taggedProductIds: string[]
  likes: number
  shares: number
  comments: number
  type: string
  liked: boolean
  createdAt: string
}

interface Comment {
  id: string
  authorName: string
  avatar: string | null
  content: string
  createdAt: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const TYPE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  review:   { color: 'text-amber-500',  bg: 'bg-amber-500/10',  label: 'Review' },
  style:    { color: 'text-violet-500', bg: 'bg-violet-500/10', label: 'Style' },
  haul:     { color: 'text-emerald-500',bg: 'bg-emerald-500/10',label: 'Haul' },
  tip:      { color: 'text-sky-500',    bg: 'bg-sky-500/10',    label: 'Tip' },
  question: { color: 'text-rose-500',   bg: 'bg-rose-500/10',   label: 'Question' },
}

function PostCard({ post, index, currentUserId, onDelete }: {
  post: Post
  index: number
  currentUserId?: string
  onDelete: (id: string) => void
}) {
  const { goProduct } = useShopRouter()
  const [liked, setLiked] = useState(post.liked)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [bookmarked, setBookmarked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const tc = TYPE_CONFIG[post.type] || TYPE_CONFIG.review

  const handleLike = async () => {
    const prev = liked
    setLiked(!prev)
    setLikeCount(prev ? likeCount - 1 : likeCount + 1)
    try {
      const res = await fetch(`/api/community/posts/${post.id}/like`, { method: 'POST' })
      if (!res.ok) { setLiked(prev); setLikeCount(likeCount) }
    } catch {
      setLiked(prev); setLikeCount(likeCount)
    }
  }

  const loadComments = async () => {
    if (commentsLoaded) return
    try {
      const res = await fetch(`/api/community/posts/${post.id}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch {}
    setCommentsLoaded(true)
  }

  const toggleComments = () => {
    if (!showComments) loadComments()
    setShowComments(!showComments)
  }

  const submitComment = async () => {
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setComments((prev) => [...prev, data.comment])
        setCommentText('')
        toast.success('Comment posted!')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to post comment')
      }
    } catch {
      toast.error('Failed to post comment')
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/community/posts/${post.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Post deleted')
        onDelete(post.id)
      } else {
        toast.error('Failed to delete post')
      }
    } catch {
      toast.error('Failed to delete post')
    }
  }

  const isOwner = currentUserId && post.userId === currentUserId

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3 pb-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-border/30 overflow-hidden">
          {post.avatar
            ? <img src={post.avatar} alt={post.author} className="h-full w-full object-cover" />
            : <User className="h-5 w-5 text-primary/60" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground truncate">{post.author}</span>
            <Badge className={`h-4 px-1.5 ${tc.bg} ${tc.color} text-[8px] border-0 shrink-0`}>{tc.label}</Badge>
          </div>
          <span className="text-[10px] text-muted-foreground">{timeAgo(post.createdAt)}</span>
        </div>
        <div className="relative">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted/50"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                className="absolute right-0 top-8 z-10 w-36 rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden"
              >
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50"
                  onClick={() => {
                    if (navigator.share) navigator.share({ text: post.content })
                    else { navigator.clipboard.writeText(post.content); toast.success('Copied!') }
                    setShowMenu(false)
                  }}
                >
                  <Share2 className="h-3.5 w-3.5" /> Share post
                </button>
                {isOwner && !confirmDelete && (
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete post
                  </button>
                )}
                {confirmDelete && (
                  <div className="border-t border-border/30 px-3 py-2 space-y-1">
                    <p className="text-[10px] text-muted-foreground">Delete this post?</p>
                    <div className="flex gap-1.5">
                      <button onClick={handleDelete} className="flex-1 rounded-lg bg-red-500 py-1 text-[10px] font-semibold text-white">Yes</button>
                      <button onClick={() => { setConfirmDelete(false); setShowMenu(false) }} className="flex-1 rounded-lg bg-muted py-1 text-[10px] font-semibold">No</button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pt-2">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className={`mt-2 grid gap-1 px-3 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.images.slice(0, 4).map((src, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl bg-muted aspect-square">
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === 3 && post.images.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-xl font-bold text-white">+{post.images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tagged products */}
      {post.taggedProductIds.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-3 mt-2 pb-1 scrollbar-hide">
          {post.taggedProductIds.map((pid) => (
            <motion.button
              key={pid}
              onClick={() => goProduct(pid)}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1"
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-primary">View product</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Engagement */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-4">
          <motion.button onClick={handleLike} className="flex items-center gap-1" whileTap={{ scale: 0.85 }}>
            <motion.div animate={liked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </motion.div>
            <span className={`text-[11px] font-medium ${liked ? 'text-red-500' : 'text-muted-foreground'}`}>{likeCount}</span>
          </motion.button>
          <button onClick={toggleComments} className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">{post.comments + comments.filter(c => !post.id).length}</span>
          </button>
          <button
            onClick={() => {
              if (navigator.share) navigator.share({ text: post.content })
              else { navigator.clipboard.writeText(post.content); toast.success('Copied!') }
            }}
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">{post.shares}</span>
          </button>
        </div>
        <motion.button
          onClick={() => { setBookmarked(!bookmarked); toast.success(bookmarked ? 'Removed' : 'Bookmarked!') }}
          whileTap={{ scale: 0.85 }}
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} />
        </motion.button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="px-3 py-2 space-y-2 max-h-48 overflow-y-auto">
              {!commentsLoaded ? (
                <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
              ) : comments.length === 0 ? (
                <p className="text-center text-[11px] text-muted-foreground py-2">No comments yet. Be first!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <div className="h-6 w-6 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {c.avatar ? <img src={c.avatar} className="h-full w-full object-cover" alt="" /> : <User className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 rounded-xl bg-muted/40 px-2.5 py-1.5">
                      <p className="text-[10px] font-semibold text-foreground">{c.authorName}</p>
                      <p className="text-[11px] text-foreground/80">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-2 px-3 pb-3">
              <Input
                placeholder="Write a comment..."
                className="h-8 text-xs"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
              />
              <Button size="icon" className="h-8 w-8 shrink-0" disabled={!commentText.trim() || submitting} onClick={submitComment}>
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PostComposer({ onPost, onClose }: { onPost: (post: Post) => void; onClose: () => void }) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [type, setType] = useState('review')
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
      const reader = new FileReader()
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const submit = async () => {
    if (!content.trim()) { toast.error('Write something first!'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type, images }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success('Post shared!')
        onPost({ ...data.post, liked: false })
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to post')
      }
    } catch {
      toast.error('Failed to post')
    }
    setSubmitting(false)
  }

  const user = session?.user as any

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl bg-card border border-border/50 shadow-2xl"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
      >
        <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
          <h2 className="text-sm font-bold text-foreground">Share with Community</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted/50"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4 space-y-3">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
              {user?.image ? <img src={user.image} className="h-full w-full object-cover" alt="" /> : <User className="h-4 w-4 text-primary/60" />}
            </div>
            <span className="text-sm font-semibold text-foreground">{user?.name || 'You'}</span>
          </div>

          {/* Type selector */}
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setType(key)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${type === key ? `${cfg.bg} ${cfg.color}` : 'bg-muted/50 text-muted-foreground'}`}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Text */}
          <Textarea
            placeholder="What's on your mind? Share your experience, tip, or haul..."
            className="min-h-[100px] resize-none text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
          />
          <div className="text-right text-[10px] text-muted-foreground">{content.length}/1000</div>

          {/* Image previews */}
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((src, i) => (
                <div key={i} className="relative h-16 w-16 rounded-xl overflow-hidden border border-border/30">
                  <img src={src} className="h-full w-full object-cover" alt="" />
                  <button
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5"
                  >
                    <X className="h-2.5 w-2.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={images.length >= 4}
              className="flex items-center gap-1.5 rounded-xl bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-40"
            >
              <ImagePlus className="h-3.5 w-3.5" /> Add photo {images.length > 0 && `(${images.length}/4)`}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={addImage} />
            <Button size="sm" onClick={submit} disabled={!content.trim() || submitting} className="gap-1.5">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {submitting ? 'Sharing...' : 'Share'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function CommunityPage() {
  const { goBack, goProfile } = useShopRouter()
  const { data: session } = useSession()
  const user = session?.user as any
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showComposer, setShowComposer] = useState(false)
  const [stats, setStats] = useState({ posts: 0, comments: 0, members: 0 })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchPosts = async (p = 1, f = filter, reset = false) => {
    if (p === 1) setLoading(true)
    else setLoadingMore(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '10' })
      if (f !== 'all') params.set('type', f)
      const res = await fetch(`/api/community/posts?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPosts((prev) => reset || p === 1 ? data.posts : [...prev, ...data.posts])
        setHasMore(data.pagination.hasMore)
        setPage(p)
      }
    } catch {}
    setLoading(false)
    setLoadingMore(false)
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/community/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      }
    } catch {}
  }

  useEffect(() => {
    fetchPosts(1, filter, true)
    fetchStats()
  }, [filter])

  const handleNewPost = (post: Post) => {
    setPosts((prev) => [post, ...prev])
    setStats((s) => ({ ...s, posts: s.posts + 1 }))
  }

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setStats((s) => ({ ...s, posts: Math.max(0, s.posts - 1) }))
  }

  const filters = [
    { key: 'all', label: 'All', icon: Smile },
    { key: 'review', label: 'Reviews', icon: Heart },
    { key: 'style', label: 'Styles', icon: Camera },
    { key: 'haul', label: 'Hauls', icon: ShoppingBag },
    { key: 'tip', label: 'Tips', icon: Award },
  ]

  return (
    <>
      <AnimatePresence>
        {showComposer && (
          <PostComposer onPost={handleNewPost} onClose={() => setShowComposer(false)} />
        )}
      </AnimatePresence>

      <motion.div className="pb-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0 text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Community
              </h1>
              <p className="text-[11px] text-muted-foreground">{stats.members.toLocaleString()} members</p>
            </div>
            <Button
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                if (!session) { toast.error('Sign in to post'); goProfile(); return }
                setShowComposer(true)
              }}
            >
              <Camera className="h-3.5 w-3.5" /> Post
            </Button>
          </div>
        </div>

        {/* Community Illustration Banner */}
        <div className="mx-4 mt-3 h-[140px] rounded-2xl overflow-hidden shadow-lg">
          <CommunityIllustration />
        </div>

        {/* Stats */}
        <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
          {[
            { value: stats.members, label: 'Members', color: 'text-primary' },
            { value: stats.posts, label: 'Posts', color: 'text-emerald-500' },
            { value: stats.comments, label: 'Comments', color: 'text-amber-500' },
          ].map((s) => (
            <motion.div
              key={s.label}
              className="flex flex-col items-center rounded-xl bg-muted/30 border border-border/30 p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className={`text-sm font-bold ${s.color}`}>{s.value.toLocaleString()}</span>
              <span className="text-[9px] text-muted-foreground">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Share CTA */}
        <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-violet-500/10 via-pink-500/5 to-rose-500/5 border border-violet-500/20 p-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Camera className="h-5 w-5 text-violet-500" />
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Share Your Experience</p>
              <p className="text-[11px] text-muted-foreground">Post a review, tip, or haul & earn 50 bonus points!</p>
            </div>
            <Button
              size="sm"
              className="gap-1 text-xs bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white shrink-0"
              onClick={() => {
                if (!session) { toast.error('Sign in first'); goProfile(); return }
                setShowComposer(true)
              }}
            >
              {session ? <Camera className="h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
              {session ? 'Share' : 'Sign In'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-3 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <f.icon className="h-3 w-3" /> {f.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="px-4 mt-3 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card p-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Smile className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-foreground">No posts yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Be the first to share!</p>
              <Button size="sm" className="mt-4 gap-1.5" onClick={() => { if (!session) { toast.error('Sign in first'); goProfile(); return }; setShowComposer(true) }}>
                <Camera className="h-3.5 w-3.5" /> Create first post
              </Button>
            </motion.div>
          ) : (
            <>
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} currentUserId={user?.id} onDelete={handleDelete} />
              ))}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" size="sm" onClick={() => fetchPosts(page + 1)} disabled={loadingMore} className="gap-1.5 text-xs">
                    {loadingMore ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    {loadingMore ? 'Loading...' : 'Load more'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  )
}
