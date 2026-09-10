'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, MessageCircle, Share2, User, Award, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

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

export default function CommunityPostPage() {
  const params = useParams()
  const id = params?.id as string
  const { goBack } = useShopRouter()
  const { data: session } = useSession()

  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/community/posts/${id}`),
          fetch(`/api/community/posts/${id}/comments`),
        ])
        if (postRes.ok) {
          const data = await postRes.json()
          setPost(data.post)
          setLiked(data.post.liked)
          setLikeCount(data.post.likes)
        }
        if (commentsRes.ok) {
          const data = await commentsRes.json()
          setComments(data.comments || [])
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [id])

  const handleLike = async () => {
    const prev = liked
    setLiked(!prev)
    setLikeCount(prev ? likeCount - 1 : likeCount + 1)
    try {
      const res = await fetch(`/api/community/posts/${id}/like`, { method: 'POST' })
      if (!res.ok) { setLiked(prev); setLikeCount(likeCount) }
    } catch { setLiked(prev); setLikeCount(likeCount) }
  }

  const submitComment = async () => {
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/community/posts/${id}/comments`, {
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
    } catch { toast.error('Network error') }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-muted-foreground">Post not found</p>
        <Button size="sm" onClick={goBack}>Go back</Button>
      </div>
    )
  }

  const tc = TYPE_CONFIG[post.type] || TYPE_CONFIG.review

  return (
    <motion.div className="pb-24 max-w-xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-bold text-foreground">Post</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Post */}
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 p-4 pb-0">
            <div className="h-11 w-11 shrink-0 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border/30">
              {post.avatar
                ? <img src={post.avatar} alt={post.author} className="h-full w-full object-cover" />
                : <User className="h-5 w-5 text-primary/60" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground">{post.author}</span>
                <Badge className={`h-4 px-1.5 ${tc.bg} ${tc.color} text-[8px] border-0 shrink-0`}>{tc.label}</Badge>
              </div>
              <span className="text-[10px] text-muted-foreground">{timeAgo(post.createdAt)}</span>
            </div>
          </div>

          <div className="px-4 pt-3">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.images?.length > 0 && (
            <div className={`mt-3 grid gap-1 px-4 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {post.images.map((src: string, i: number) => (
                <div key={i} className="overflow-hidden rounded-xl bg-muted aspect-square">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-5 px-4 py-3 border-t border-border/20 mt-3">
            <motion.button onClick={handleLike} className="flex items-center gap-1.5" whileTap={{ scale: 0.85 }}>
              <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-medium ${liked ? 'text-red-500' : 'text-muted-foreground'}`}>{likeCount} likes</span>
            </motion.button>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{comments.length} comments</span>
            </div>
            <button
              className="flex items-center gap-1.5 ml-auto"
              onClick={() => {
                if (navigator.share) navigator.share({ text: post.content })
                else { navigator.clipboard.writeText(post.content); toast.success('Copied!') }
              }}
            >
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">{comments.length} Comments</h2>
          {comments.length === 0 ? (
            <div className="rounded-xl border border-border/30 bg-muted/20 p-6 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((c) => (
              <motion.div key={c.id} className="flex gap-2.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {c.avatar ? <img src={c.avatar} className="h-full w-full object-cover" alt="" /> : <User className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 rounded-2xl bg-muted/40 px-3 py-2">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-foreground">{c.authorName}</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground/80">{c.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Comment Input pinned to bottom */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-border/30 bg-background/95 backdrop-blur-xl px-4 py-3 max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {(session?.user as any)?.image
              ? <img src={(session?.user as any).image} className="h-full w-full object-cover" alt="" />
              : <User className="h-4 w-4 text-primary/60" />}
          </div>
          <Input
            placeholder={session ? 'Write a comment...' : 'Sign in to comment'}
            className="h-9 text-sm flex-1"
            value={commentText}
            disabled={!session}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
          />
          <Button size="icon" className="h-9 w-9 shrink-0" disabled={!commentText.trim() || submitting || !session} onClick={submitComment}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
