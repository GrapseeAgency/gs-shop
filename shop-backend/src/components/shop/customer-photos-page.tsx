'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Camera, Heart, Filter, Search, Star,
  ImagePlus, Trophy, Calendar, Package, X, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface CustomerPhoto {
  id: string
  productId: string
  userId: string | null
  userName: string
  imageUrl: string | null
  caption: string | null
  likes: number
  isFeatured: boolean
  createdAt: string
  product?: { name: string; price: number; imageUrl?: string | null } | null
}

type FilterType = 'all' | 'featured' | 'popular' | 'recent'

const filterOptions: { key: FilterType; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All', icon: Camera },
  { key: 'featured', label: 'Featured', icon: Trophy },
  { key: 'popular', label: 'Popular', icon: Heart },
  { key: 'recent', label: 'Recent', icon: Calendar },
]

export function CustomerPhotosPage() {
  const { goBack, goProduct } = useShopRouter()
  const [photos, setPhotos] = useState<CustomerPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set())
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (activeFilter === 'featured') params.set('featured', 'true')
        params.set('limit', '30')
        const res = await fetch(`/api/customer-photos?${params}`)
        if (res.ok) {
          const data = await res.json()
          setPhotos(data.photos || [])
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    fetchPhotos()
  }, [activeFilter])

  const filteredPhotos = useMemo(() => {
    let result = photos
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.userName.toLowerCase().includes(q) ||
        p.product?.name?.toLowerCase().includes(q) ||
        p.caption?.toLowerCase().includes(q)
      )
    }
    if (activeFilter === 'popular') result = [...result].sort((a, b) => b.likes - a.likes)
    if (activeFilter === 'recent') result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return result
  }, [photos, searchQuery, activeFilter])

  const photoOfTheWeek = photos.find(p => p.isFeatured) || photos[0]

  const handleLike = (photoId: string) => {
    setLikedPhotos(prev => {
      const next = new Set(prev)
      if (next.has(photoId)) { next.delete(photoId); return next }
      next.add(photoId)
      return next
    })
  }

  const handleUpload = () => {
    toast.success('Photo submitted for review!')
    setShowUpload(false)
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
              <Camera className="h-5 w-5 text-rose-500" /> Customer Photos
            </h1>
          </div>
          <Button size="sm" className="gap-1.5 bg-rose-500 hover:bg-rose-600 text-white" onClick={() => setShowUpload(true)}>
            <ImagePlus className="h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      {/* Photo of the Week */}
      {photoOfTheWeek && (
        <div className="px-4 mt-3">
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-pink-500/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-rose-500/90 text-white shadow-lg">
                <Trophy className="h-3 w-3 mr-1" /> Photo of the Week
              </Badge>
            </div>
            <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-rose-500/20 to-pink-600/20">
              {photoOfTheWeek.imageUrl ? (
                <img src={photoOfTheWeek.imageUrl} alt={photoOfTheWeek.caption || ''} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto text-rose-500/30" />
                  <span className="text-3xl mt-2 block opacity-40"></span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{photoOfTheWeek.userName}</p>
                  {photoOfTheWeek.product?.name && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{photoOfTheWeek.product.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleLike(photoOfTheWeek.id)} className="flex items-center gap-1">
                    <Heart className={`h-4 w-4 ${likedPhotos.has(photoOfTheWeek.id) ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
                    <span className="text-xs text-muted-foreground">{photoOfTheWeek.likes + (likedPhotos.has(photoOfTheWeek.id) ? 1 : 0)}</span>
                  </button>
                </div>
              </div>
              {photoOfTheWeek.caption && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{photoOfTheWeek.caption}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="px-4 mt-3">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search photos, customers, products..."
            className="pl-9 h-9 text-sm bg-muted/30 border-border/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filterOptions.map(opt => {
            const isActive = activeFilter === opt.key
            return (
              <motion.button
                key={opt.key}
                onClick={() => setActiveFilter(opt.key)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  isActive ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <opt.icon className="h-3 w-3" />
                {opt.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 mt-2 mb-1">
        <span className="text-[11px] text-muted-foreground">{filteredPhotos.length} photos</span>
      </div>

      {/* Photo Grid */}
      <div className="px-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
                <div className="aspect-square animate-pulse bg-muted" />
                <div className="p-2.5 space-y-1.5">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPhotos.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-5xl mb-4"></span>
            <p className="text-sm font-medium text-foreground">No photos found</p>
            <p className="mt-1 text-xs text-muted-foreground">Be the first to share your photos!</p>
            <Button className="mt-4 gap-2 bg-rose-500 hover:bg-rose-600 text-white" onClick={() => setShowUpload(true)}>
              <ImagePlus className="h-4 w-4" /> Upload Photo
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="aspect-square bg-gradient-to-br from-rose-500/10 to-pink-500/5 flex items-center justify-center">
                  {photo.imageUrl ? (
                    <img src={photo.imageUrl} alt={photo.caption || ''} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-10 w-10 text-muted-foreground/20" />
                  )}
                  {photo.isFeatured && (
                    <Badge className="absolute top-2 left-2 bg-amber-500/90 text-white text-[9px]">
                      <Trophy className="h-2.5 w-2.5 mr-0.5" /> Featured
                    </Badge>
                  )}
                  <button
                    onClick={() => handleLike(photo.id)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm"
                  >
                    <Heart className={`h-3.5 w-3.5 ${likedPhotos.has(photo.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-foreground truncate">{photo.userName}</p>
                  {photo.product?.name && (
                    <button onClick={() => goProduct(photo.productId)} className="text-[10px] text-primary truncate block hover:underline">
                      {photo.product.name}
                    </button>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{photo.likes + (likedPhotos.has(photo.id) ? 1 : 0)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {photo.caption && (
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{photo.caption}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Sheet */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-t-3xl bg-card border-t border-border p-5"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-foreground">Share Your Photo</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowUpload(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 h-36">
                  <div className="text-center">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground mt-2">Tap to select a photo</p>
                  </div>
                </div>
                <Input placeholder="Your name" className="h-9 text-sm" />
                <Input placeholder="Caption (optional)" className="h-9 text-sm" />
                <Input placeholder="Product name or URL" className="h-9 text-sm" />
                <Button className="w-full gap-2 bg-rose-500 hover:bg-rose-600 text-white" onClick={handleUpload}>
                  <ImagePlus className="h-4 w-4" /> Submit Photo
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
