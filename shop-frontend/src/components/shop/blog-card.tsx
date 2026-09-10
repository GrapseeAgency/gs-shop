'use client'

import { motion } from 'framer-motion'
import { Heart, Clock, BookOpen, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type BlogCategory = 'tips' | 'news' | 'review' | 'guide' | 'lifestyle'

interface BlogCardProps {
  title: string
  slug: string
  excerpt?: string
  category: BlogCategory
  author: string
  authorAvatar?: string | null
  publishedAt: string
  readTime?: number
  likeCount?: number
  thumbnailUrl?: string | null
  onClick?: () => void
  index?: number
}

const categoryConfig: Record<BlogCategory, { label: string; color: string; bg: string }> = {
  tips: { label: 'Tips', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  news: { label: 'News', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  review: { label: 'Review', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  guide: { label: 'Guide', color: 'text-violet-400', bg: 'bg-violet-500/15' },
  lifestyle: { label: 'Lifestyle', color: 'text-rose-400', bg: 'bg-rose-500/15' },
}

const categoryGradients: Record<BlogCategory, string> = {
  tips: 'from-emerald-500/20 to-teal-600/10',
  news: 'from-cyan-500/20 to-blue-600/10',
  review: 'from-amber-500/20 to-orange-600/10',
  guide: 'from-violet-500/20 to-purple-600/10',
  lifestyle: 'from-rose-500/20 to-pink-600/10',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function BlogCard({
  title,
  slug,
  excerpt,
  category,
  author,
  authorAvatar,
  publishedAt,
  readTime = 3,
  likeCount = 0,
  thumbnailUrl,
  onClick,
  index = 0,
}: BlogCardProps) {
  const config = categoryConfig[category] || categoryConfig.news
  const gradient = categoryGradients[category] || categoryGradients.news

  return (
    <motion.article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/20 hover:shadow-lg active:scale-[0.98]"
      onClick={onClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
    >
      {/* Thumbnail */}
      <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden`}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <BookOpen className="h-10 w-10 text-muted-foreground/30" />
        )}
        {/* Category badge */}
        <Badge className={`absolute left-2 top-2 ${config.bg} ${config.color} text-[9px] px-1.5 py-0 border-0`}>
          {config.label}
        </Badge>
        {/* Like count */}
        {likeCount > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-background/60 backdrop-blur-sm px-1.5 py-0.5">
            <Heart className="h-2.5 w-2.5 text-rose-400 fill-rose-400" />
            <span className="text-[9px] font-semibold text-foreground">{likeCount}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="mb-1 text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {title}
        </h3>
        {excerpt && (
          <p className="mb-2 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Footer: author, date, read time */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Author avatar */}
            {authorAvatar ? (
              <img src={authorAvatar} alt={author} className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <span className="text-[10px] font-medium text-foreground truncate max-w-[80px]">
              {author}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <span>{formatDate(publishedAt)}</span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {readTime}m
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

