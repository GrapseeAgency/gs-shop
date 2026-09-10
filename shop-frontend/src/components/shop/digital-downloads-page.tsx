'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Download, FileText, Code, Palette, BookOpen,
  Music, Image, Search, Filter, X, Package, Star,
  ChevronRight, Clock, HardDrive, CheckCircle2, Lock,
  ShoppingCart, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface DigitalProduct {
  id: string
  name: string
  description: string
  imageUrl: string | null
  category: string
  price: number
  fileType: string
  fileExtension: string
  fileSize: string
  fileSizeMB: number
  downloadsAllowed: number
  rating: number
  purchaseCount: number
  isPurchased: boolean
  licenseKey: string | null
  downloadsRemaining: number
  purchaseDate: string | null
}

interface MyDownload {
  productId: string
  productName: string
  downloadsRemaining: number
  totalDownloads: number
  lastDownloadedAt: string | null
  licenseKey: string
}

const fileTypeConfig: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  ebook: { icon: BookOpen, color: 'amber', label: 'E-Book' },
  software: { icon: Code, color: 'sky', label: 'Software' },
  template: { icon: Palette, color: 'violet', label: 'Template' },
  course: { icon: FileText, color: 'emerald', label: 'Course' },
  audio: { icon: Music, color: 'rose', label: 'Audio' },
  graphic: { icon: Image, color: 'pink', label: 'Graphic' },
}

export function DigitalDownloadsPage() {
  const { goBack, goProduct } = useShopRouter()
  const [products, setProducts] = useState<DigitalProduct[]>([])
  const [myDownloads, setMyDownloads] = useState<MyDownload[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState<'browse' | 'my-downloads'>('browse')

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/digital-downloads')
        if (res.ok) {
          const data = await res.json()
          setProducts(Array.isArray(data.products) ? data.products : [])
          setMyDownloads(Array.isArray(data.myDownloads) ? data.myDownloads : [])
          setIsAuthenticated(data.isAuthenticated || false)
        } else if (res.status === 401) {
          // Not authenticated, show products but mark as not purchased
          const data = await res.json()
          setProducts(Array.isArray(data.products) ? data.products : [])
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error('Failed to fetch digital products:', err)
        toast.error('Failed to load digital products')
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'ebook', label: 'E-Books' },
    { key: 'software', label: 'Software' },
    { key: 'template', label: 'Templates' },
    { key: 'course', label: 'Courses' },
    { key: 'graphic', label: 'Graphics' },
  ]

  const filteredProducts = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = activeFilter === 'all' || p.fileType === activeFilter
    return matchesSearch && matchesFilter
  })

  const purchasedProducts = products.filter(p => p.isPurchased)

  const handlePurchase = async (productId: string, paymentMethod: 'wallet' | 'stripe' = 'wallet') => {
    if (!isAuthenticated) {
      toast.error('Please sign in to purchase', { description: 'Authentication required for secure transactions' })
      return
    }

    try {
      const res = await fetch('/api/digital-downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: 'purchase', paymentMethod }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        if (data.needsTopUp) {
          toast.error('Insufficient wallet balance', { 
            description: `Required: ${formatPrice(data.required)} | Available: ${formatPrice(data.current)}` 
          })
        } else if (res.status === 401) {
          toast.error('Please sign in to purchase')
        } else {
          toast.error(data.error || 'Purchase failed')
        }
        return
      }

      if (data.requiresStripe) {
        // Redirect to Stripe checkout
        toast.info('Redirecting to secure checkout...')
        // In a full implementation, redirect to Stripe checkout
        // window.location.href = `/checkout/digital?productId=${productId}`
        return
      }

      toast.success('Product purchased!', { 
        description: `License: ${data.licenseKey}` 
      })
      
      // Update product state with purchase info
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { 
              ...p, 
              isPurchased: true, 
              licenseKey: data.licenseKey,
              downloadsRemaining: data.downloadsRemaining || 3 
            } 
          : p
      ))
      
      // Refresh my downloads
      const refreshRes = await fetch('/api/digital-downloads')
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        setMyDownloads(refreshData.myDownloads || [])
      }
    } catch {
      toast.error('Purchase failed. Please try again.')
    }
  }

  const handleDownload = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to download', { description: 'Authentication required' })
      return
    }

    setDownloadingId(productId)
    setDownloadProgress(0)

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 15
      })
    }, 200)

    try {
      const res = await fetch('/api/digital-downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: 'download' }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        clearInterval(interval)
        setDownloadingId(null)
        setDownloadProgress(0)
        
        if (res.status === 401) {
          toast.error('Please sign in to download')
        } else if (res.status === 403) {
          toast.error('Download limit reached', { 
            description: 'Contact support for assistance' 
          })
        } else if (res.status === 404) {
          toast.error('Purchase not found', { 
            description: 'Please purchase this product first' 
          })
        } else {
          toast.error(data.error || 'Download failed')
        }
        return
      }

      // Got signed download URL
      if (data.downloadUrl) {
        // In a real implementation, trigger actual file download
        // window.open(data.downloadUrl, '_blank')
        
        setTimeout(() => {
          setDownloadingId(null)
          setDownloadProgress(0)
          toast.success('Download ready!', { 
            description: `${data.downloadsRemaining} downloads remaining` 
          })
          setMyDownloads(prev =>
            prev.map(d => d.productId === productId 
              ? { 
                  ...d, 
                  downloadsRemaining: data.downloadsRemaining,
                  totalDownloads: data.totalDownloads 
                } 
              : d
            )
          )
        }, 1500)
      }
    } catch (err) {
      clearInterval(interval)
      setDownloadingId(null)
      setDownloadProgress(0)
      toast.error('Download failed. Please try again.')
    }
  }

  const renderProductCard = (product: DigitalProduct, index: number) => {
    const config = fileTypeConfig[product.fileType] || fileTypeConfig.ebook
    const isDownloading = downloadingId === product.id
    const downloadItem = myDownloads.find(d => d.productId === product.id)
    const remainingDownloads = downloadItem?.downloadsRemaining ?? product.downloadsAllowed

    return (
      <motion.div
        key={product.id}
        className="overflow-hidden rounded-2xl border border-border/50 bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        {/* File type header */}
        <div className={`relative bg-gradient-to-r from-${config.color}-500/10 to-${config.color}-500/5 p-4`}>
          <div className="absolute right-3 top-3">
            <Badge className={`bg-${config.color}-500/10 text-${config.color}-500 text-[9px]`}>
              {product.fileExtension}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${config.color}-500/20`}>
              <config.icon className={`h-5 w-5 text-${config.color}-500`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate pr-12">{product.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <HardDrive className="h-2.5 w-2.5" />{product.fileSize}
                </span>
                <span className="text-[10px] text-muted-foreground">{config.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-2.5 w-2.5 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">{product.purchaseCount} purchased</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
            {product.isPurchased ? (
              <div className="flex items-center gap-1.5">
                <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px]">
                  <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />Purchased
                </Badge>
                <Badge variant="outline" className="text-[9px]">
                  <Download className="mr-0.5 h-2.5 w-2.5" />{remainingDownloads} left
                </Badge>
              </div>
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Download / Purchase Button */}
        <div className="px-4 pb-3">
          {isDownloading ? (
            <div className="w-full">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  animate={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1">Downloading... {downloadProgress}%</p>
            </div>
          ) : product.isPurchased ? (
            <Button
              className="w-full gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white text-xs"
              onClick={() => handleDownload(product.id)}
              disabled={remainingDownloads <= 0}
            >
              <Download className="h-3.5 w-3.5" />
              {remainingDownloads > 0 ? 'Download' : 'No downloads left'}
            </Button>
          ) : (
            <Button
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
              onClick={() => handlePurchase(product.id)}
            >
              <ShoppingCart className="h-3.5 w-3.5" /> Purchase & Download
            </Button>
          )}
        </div>
      </motion.div>
    )
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
              <Download className="h-5 w-5 text-emerald-500" /> Digital Downloads
            </h1>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium text-center transition-colors ${
              activeTab === 'browse' ? 'bg-emerald-500/10 text-emerald-500' : 'text-muted-foreground'
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setActiveTab('my-downloads')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium text-center transition-colors ${
              activeTab === 'my-downloads' ? 'bg-emerald-500/10 text-emerald-500' : 'text-muted-foreground'
            }`}
          >
            My Downloads {purchasedProducts.length > 0 && `(${purchasedProducts.length})`}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'browse' ? (
          <motion.div key="browse" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Search */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search digital products..."
                  className="w-full rounded-xl border border-border bg-card pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide pb-1">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    activeFilter === f.key ? 'bg-emerald-500 text-white' : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="px-4 mt-3 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
                    <div className="h-16 animate-pulse bg-muted" />
                    <div className="flex flex-col gap-2 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="h-8 w-full animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))
              ) : filteredProducts.length === 0 ? (
                <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <Package className="h-8 w-8 text-emerald-500/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No digital products found</p>
                  <p className="mt-1 text-xs text-muted-foreground">Try a different filter or search</p>
                </motion.div>
              ) : (
                filteredProducts.map((product, index) => renderProductCard(product, index))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="my-downloads" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="px-4 mt-3">
              {purchasedProducts.length === 0 ? (
                <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <Download className="h-8 w-8 text-emerald-500/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No purchases yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Browse digital products and purchase to download</p>
                  <Button onClick={() => setActiveTab('browse')} variant="outline" className="mt-3 gap-2 text-xs">
                    <Eye className="h-3.5 w-3.5" /> Browse Products
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {purchasedProducts.map((product, index) => renderProductCard(product, index))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

