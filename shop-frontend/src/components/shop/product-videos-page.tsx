'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Play, Search, Clock, Eye, Filter,
  X, ChevronRight, Star, Package, Film,
  MonitorPlay, Box, Wrench, GitCompare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'

interface VideoItem {
  id: string
  title: string
  thumbnailUrl: string | null
  videoUrl: string | null
  duration: string
  views: number
  type: string
  productId?: string
  product?: {
    id: string
    name: string
    price: number
    imageUrl: string | null
  }
}

interface VideoModalProps {
  video: VideoItem | null
  onClose: () => void
}

function VideoModal({ video, onClose }: VideoModalProps) {
  useEffect(() => {
    if (video) {
      fetch('/api/product-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id }),
      }).catch(() => {})
    }
  }, [video])

  if (!video) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-[430px] bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto"
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Player Placeholder */}
        <div className="relative aspect-video bg-black rounded-t-3xl flex items-center justify-center">
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-glass-deep/20 backdrop-blur-sm"
            whileTap={{ scale: 0.9 }}
          >
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          </motion.div>
          <button onClick={onClose} className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
            <X className="h-4 w-4 text-white" />
          </button>
          <Badge className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px]">
            <Clock className="mr-1 h-3 w-3" />{video.duration}
          </Badge>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3 className="text-base font-bold text-foreground">{video.title}</h3>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="text-[10px] capitalize">{video.type}</Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" />{video.views.toLocaleString()} views
            </span>
          </div>

          {/* Related Product */}
          {video.product && (
            <motion.div
              className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3"
              whileTap={{ scale: 0.98 }}
            >
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted/50">
                {video.product.imageUrl ? (
                  <img src={video.product.imageUrl} alt={video.product.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 m-auto text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{video.product.name}</p>
                <p className="text-xs text-primary font-bold">{formatPrice(video.product.price)}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ProductVideosPage() {
  const { goBack, goProduct } = useShopRouter()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (activeFilter !== 'all') params.set('type', activeFilter)
        const res = await fetch(`/api/product-videos?${params}`)
        if (res.ok) {
          const data = await res.json()
          setVideos(Array.isArray(data.data) ? data.data : [])
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    fetchVideos()
  }, [activeFilter])

  const filters = [
    { key: 'all', label: 'All', icon: Film },
    { key: 'review', label: 'Reviews', icon: Star },
    { key: 'unboxing', label: 'Unboxing', icon: Box },
    { key: 'tutorial', label: 'Tutorials', icon: Wrench },
    { key: 'comparison', label: 'Compare', icon: GitCompare },
  ]

  const filteredVideos = videos.filter(v => {
    if (!search) return true
    return v.title.toLowerCase().includes(search.toLowerCase())
  })

  const typeColors: Record<string, string> = {
    review: 'bg-amber-500/10 text-amber-500',
    unboxing: 'bg-sky-500/10 text-sky-500',
    tutorial: 'bg-emerald-500/10 text-emerald-500',
    comparison: 'bg-violet-500/10 text-violet-500',
  }

  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MonitorPlay className="h-5 w-5 text-sky-500" /> Product Videos
            </h1>
          </div>
          <Badge variant="outline" className="text-[10px]">{filteredVideos.length} videos</Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full rounded-xl border border-border bg-card pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === f.key ? 'bg-sky-500 text-white' : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <f.icon className="h-3 w-3" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="px-4 mt-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card">
                <div className="aspect-video animate-pulse bg-muted" />
                <div className="p-2 space-y-1.5">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10">
              <Film className="h-8 w-8 text-sky-500/50" />
            </div>
            <p className="text-sm font-medium text-foreground">No videos found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different filter or search term</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredVideos.map((video, index) => (
              <motion.button
                key={video.id}
                className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedVideo(video)}
                whileTap={{ scale: 0.97 }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-sky-500/20 to-violet-500/20">
                      <Film className="h-8 w-8 text-sky-500/40" />
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-glass-deep/30 backdrop-blur-sm">
                      <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <Badge className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0">
                    <Clock className="mr-0.5 h-2.5 w-2.5" />{video.duration}
                  </Badge>
                  {/* Type badge */}
                  <Badge className={`absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0 ${typeColors[video.type] || 'bg-muted text-muted-foreground'}`}>
                    {video.type}
                  </Badge>
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">{video.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" />{video.views}
                    </span>
                    {video.product && (
                      <span className="text-[10px] text-primary font-medium truncate">{formatPrice(video.product.price)}</span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {!loading && videos.length > 0 && (
        <div className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Package className="h-4 w-4 text-sky-500" /> Related Products
            </h3>
            <Button variant="ghost" size="sm" className="text-xs text-sky-500">View All</Button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {videos.filter(v => v.product).slice(0, 5).map((video) => (
              video.product && (
                <motion.button
                  key={video.product.id}
                  className="flex-shrink-0 w-28 flex flex-col items-center rounded-xl border border-border/50 bg-card p-2"
                  onClick={() => goProduct(video.product!.id)}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="h-16 w-16 overflow-hidden rounded-lg bg-muted/50 mb-1.5">
                    {video.product.imageUrl ? (
                      <img src={video.product.imageUrl} alt={video.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 m-auto text-muted-foreground/40" />
                    )}
                  </div>
                  <p className="text-[10px] text-foreground text-center line-clamp-1 font-medium">{video.product.name}</p>
                  <p className="text-[10px] text-primary font-bold">{formatPrice(video.product.price)}</p>
                </motion.button>
              )
            ))}
          </div>
        </div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

