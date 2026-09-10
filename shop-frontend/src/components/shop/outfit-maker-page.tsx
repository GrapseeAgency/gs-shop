'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import {
  Shirt, ArrowRight, Plus, X, Save, Heart, Tag, Sparkles,
  ChevronRight, ShoppingBag, User, Star, Layers, Palette,
} from 'lucide-react'

interface Product {
  id: string; name: string; price: number; comparePrice: number | null
  imageUrl: string | null; category: { name: string; slug: string } | null
  rating: number; reviewCount: number
}

interface SavedOutfit {
  id: string; name: string; items: Array<{ productId: string; productName: string; price: number; imageUrl: string | null; category: string }>
  totalPrice: number; style: string; tags: string[]; author: string; likes: number
}

type CategoryTab = 'top' | 'bottom' | 'shoes' | 'accessories'
type StyleTag = 'Casual' | 'Formal' | 'Sporty'

const CAT_ICONS: Record<CategoryTab, typeof Shirt> = { top: Shirt, bottom: Shirt, shoes: ShoppingBag, accessories: Sparkles }
const CAT_LABELS: Record<CategoryTab, string> = { top: 'Tops', bottom: 'Bottoms', shoes: 'Shoes', accessories: 'Accessories' }
const STYLE_COLORS: Record<StyleTag, string> = {
  Casual: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-400',
  Formal: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400',
  Sporty: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400',
}

export function OutfitMakerPage() {
  const { goBack, goProduct } = useShopRouter()
  const outfitItems = useShopStore((s) => s.outfitItems)
  const addToOutfit = useShopStore((s) => s.addToOutfit)
  const removeFromOutfit = useShopStore((s) => s.removeFromOutfit)
  const clearOutfit = useShopStore((s) => s.clearOutfit)

  const [products, setProducts] = useState<Product[]>([])
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('top')
  const [activeStyle, setActiveStyle] = useState<StyleTag>('Casual')
  const [outfitName, setOutfitName] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchProducts = useCallback(async () => {
    try { const res = await fetch('/api/products?limit=30'); const data = await res.json(); setProducts(data.data || []) } catch { setProducts([]) }
  }, [])
  const fetchOutfits = useCallback(async () => {
    try { const res = await fetch('/api/outfits'); const data = await res.json(); setSavedOutfits(data.data || []) } catch { setSavedOutfits([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { Promise.all([fetchProducts(), fetchOutfits()]) }, [fetchProducts, fetchOutfits])

  const mapCategory = (p: Product): CategoryTab => {
    const slug = p.category?.slug?.toLowerCase() || ''
    const name = p.name.toLowerCase()
    if (slug.includes('website') || name.includes('shirt') || name.includes('hoodie')) return 'top'
    if (slug.includes('design') || name.includes('pant') || name.includes('jean')) return 'bottom'
    if (slug.includes('marketing') || name.includes('shoe') || name.includes('sneaker')) return 'shoes'
    if (slug.includes('seo') || name.includes('watch') || name.includes('bag')) return 'accessories'
    return (['top', 'bottom', 'shoes', 'accessories'] as CategoryTab[])[Math.abs(p.id.charCodeAt(0)) % 4]
  }

  const filteredProducts = products.filter((p) => mapCategory(p) === activeCategory)

  const selectedProducts = products.filter((p) => outfitItems.includes(p.id))
  const totalOutfitPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0)

  const saveOutfit = async () => {
    if (outfitItems.length === 0) return
    try {
      await fetch('/api/outfits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: outfitName || 'My Outfit', items: selectedProducts.map((p) => ({ productId: p.id, productName: p.name, price: p.price, imageUrl: p.imageUrl, category: mapCategory(p) })), style: activeStyle, tags: [activeStyle] }),
      })
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2000)
    } catch { /* silent */ }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4"><div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded-lg w-48" /><div className="h-32 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-36 bg-muted rounded-xl" />)}</div>
      </div></div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-muted active:scale-95 transition"><ArrowRight className="w-5 h-5 rotate-180" /></button>
          <div><h1 className="text-lg font-bold text-foreground flex items-center gap-2"><Layers className="w-5 h-5 text-rose-500" />Outfit Maker</h1><p className="text-xs text-muted-foreground">Compose your perfect look</p></div>
        </div>
      </motion.div>

      <div className="px-4 mt-4 space-y-4">
        {/* Style Tags */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(Object.keys(STYLE_COLORS) as StyleTag[]).map((style) => (
            <button key={style} onClick={() => setActiveStyle(style)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeStyle === style ? `bg-gradient-to-r ${STYLE_COLORS[style]}` : 'border-border bg-card text-muted-foreground'}`}>{style}</button>
          ))}
        </motion.div>

        {/* My Outfit Panel */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Palette className="w-4 h-4 text-rose-400" />Your Outfit</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{outfitItems.length} items</span>
              {outfitItems.length > 0 && <button onClick={clearOutfit} className="text-xs text-rose-400 font-medium">Clear</button>}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(['top', 'bottom', 'shoes', 'accessories'] as CategoryTab[]).map((cat) => {
              const Icon = CAT_ICONS[cat]
              const productInSlot = selectedProducts.find((p) => mapCategory(p) === cat)
              return (
                <motion.div key={cat} whileTap={{ scale: 0.95 }} className={`relative rounded-xl border-2 border-dashed p-2 flex flex-col items-center justify-center min-h-[80px] ${productInSlot ? 'border-rose-500/30 bg-rose-500/5' : 'border-border bg-muted/30'}`}>
                  {productInSlot ? (
                    <>
                      <button onClick={() => removeFromOutfit(productInSlot.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                      <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center mb-1">
                        {productInSlot.imageUrl ? <img src={productInSlot.imageUrl} alt={productInSlot.name} className="w-10 h-10 rounded-lg object-cover" /> : <ShoppingBag className="w-4 h-4 text-rose-400" />}
                      </div>
                      <p className="text-[9px] text-foreground text-center leading-tight line-clamp-2">{productInSlot.name}</p>
                      <p className="text-[9px] text-rose-400 font-medium">{productInSlot.price.toLocaleString()}</p>
                    </>
                  ) : (<><Icon className="w-5 h-5 text-muted-foreground/50 mb-1" /><p className="text-[9px] text-muted-foreground">{CAT_LABELS[cat]}</p><Plus className="w-3 h-3 text-muted-foreground/40 mt-0.5" /></>)}
                </motion.div>
              )
            })}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div><p className="text-xs text-muted-foreground">Total Outfit Price</p><p className="text-lg font-bold text-foreground">{totalOutfitPrice.toLocaleString()}</p></div>
            <button onClick={saveOutfit} disabled={outfitItems.length === 0} className="px-4 py-2 rounded-lg bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 active:scale-95 transition disabled:opacity-50">
              <Save className="w-3.5 h-3.5" />{saveSuccess ? 'Saved!' : 'Save'}
            </button>
          </div>
        </motion.div>

        {/* Outfit Name */}
        <input value={outfitName} onChange={(e) => setOutfitName(e.target.value)} placeholder="Name your outfit..." className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/50" />

        {/* Category Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
          {(['top', 'bottom', 'shoes', 'accessories'] as CategoryTab[]).map((cat) => {
            const Icon = CAT_ICONS[cat]
            const hasItem = selectedProducts.some((p) => mapCategory(p) === cat)
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all relative ${activeCategory === cat ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
                <Icon className="w-3.5 h-3.5" />{CAT_LABELS[cat]}
                {hasItem && <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-rose-400" />}
              </button>
            )
          })}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.length === 0 ? (
            <div className="col-span-2 text-center py-8"><ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No products in this category</p></div>
          ) : filteredProducts.map((product, idx) => {
            const isInOutfit = outfitItems.includes(product.id)
            return (
              <motion.div key={product.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }} onClick={() => isInOutfit ? removeFromOutfit(product.id) : addToOutfit(product.id)} className={`rounded-xl border p-3 cursor-pointer transition-all ${isInOutfit ? 'border-rose-500/40 bg-rose-500/5 shadow-md' : 'border-border bg-card hover:border-rose-500/20'}`}>
                <div className="w-full aspect-square rounded-lg bg-muted/50 flex items-center justify-center mb-2 overflow-hidden">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />}
                </div>
                <p className="text-xs font-medium text-foreground line-clamp-2">{product.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-bold text-foreground">{product.price.toLocaleString()}</p>
                  {isInOutfit ? <span className="text-[10px] text-rose-400 font-medium">Added </span> : <Plus className="w-4 h-4 text-muted-foreground" />}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Saved Outfits */}
        <div className="pt-2">
          <button onClick={() => setShowSaved(!showSaved)} className="w-full flex items-center justify-between py-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" />Saved Outfits <span className="text-xs text-muted-foreground font-normal">({savedOutfits.length})</span></h3>
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showSaved ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>{showSaved && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
              {savedOutfits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No saved outfits yet</p>
              ) : savedOutfits.map((outfit) => (
                <div key={outfit.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center"><User className="w-3 h-3 text-rose-400" /></div><div><p className="text-xs font-medium text-foreground">{outfit.name}</p><p className="text-[10px] text-muted-foreground">by {outfit.author}</p></div></div>
                    <div className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /><span className="text-[10px] text-muted-foreground">{outfit.likes}</span></div>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">{outfit.items.map((_, i) => <div key={i} className="flex-shrink-0 w-14 h-14 rounded-lg bg-muted/50 flex items-center justify-center border border-border"><ShoppingBag className="w-4 h-4 text-muted-foreground/40" /></div>)}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r ${STYLE_COLORS[outfit.style as StyleTag] || STYLE_COLORS.Casual}`}><Tag className="w-2.5 h-2.5" />{outfit.style}</span>
                    <p className="text-xs font-semibold text-foreground">{outfit.totalPrice.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}</AnimatePresence>
        </div>
      </div>
    </div>
  )
}

