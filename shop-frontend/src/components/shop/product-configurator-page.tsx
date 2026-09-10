'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Palette, Ruler, Star, ShoppingCart, Plus,
  Check, Package, Gift, Shield, ChevronRight, Sparkles,
  X, Paintbrush, Box, Layers, Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface ConfiguratorOption {
  color?: string[]
  size?: string[]
  material?: string[]
  storage?: string[]
}

interface Configurator {
  id: string
  productId: string
  options: ConfiguratorOption
  basePrice: number
  product: { name: string; slug: string; imageUrl?: string | null; price?: number }
  totalOptions?: number
  totalCombinations?: number
}

const colorSwatches = [
  { name: 'Midnight Black', hex: '#1a1a2e' },
  { name: 'Pearl White', hex: '#f8f9fa' },
  { name: 'Rose Gold', hex: '#e8a598' },
  { name: 'Ocean Blue', hex: '#4361ee' },
  { name: 'Stealth Black', hex: '#0d0d0d' },
  { name: 'Arctic Silver', hex: '#c0c0c0' },
  { name: 'Sunset Orange', hex: '#ff6b35' },
  { name: 'Forest Green', hex: '#2d6a4f' },
]

const priceModifiers: Record<string, Record<string, number>> = {
  color: { 'Midnight Black': 0, 'Pearl White': 10, 'Rose Gold': 20, 'Ocean Blue': 15, 'Stealth Black': 0, 'Arctic Silver': 10, 'Sunset Orange': 15, 'Forest Green': 10 },
  size: { 'Compact': -20, 'Standard': 0, 'XL': 30, 'Pro': 80 },
  material: { 'Plastic': 0, 'Aluminum': 40, 'Carbon Fiber': 80, 'Titanium': 120, 'Premium Glass': 60 },
  storage: { '64GB': 0, '128GB': 30, '256GB': 60, '512GB': 120, '1TB': 200 },
}

interface AddOn {
  id: string
  name: string
  price: number
  icon: React.ElementType
  description: string
}

const addOns: AddOn[] = [
  { id: 'engraving', name: 'Custom Engraving', price: 15, icon: Paintbrush, description: 'Add a personal message' },
  { id: 'gift-wrap', name: 'Premium Gift Wrap', price: 8, icon: Gift, description: 'Beautiful gift packaging' },
  { id: 'warranty', name: 'Extended Warranty', price: 49, icon: Shield, description: '2-year extended coverage' },
  { id: 'setup', name: 'Expert Setup', price: 25, icon: Wrench, description: 'Professional setup service' },
]

const optionIcons: Record<string, React.ElementType> = {
  color: Palette,
  size: Ruler,
  material: Layers,
  storage: Box,
}

export function ProductConfiguratorPage() {
  const { goBack } = useShopRouter()
  const { addToCart } = useShopStore()
  const [configurators, setConfigurators] = useState<Configurator[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConfig, setSelectedConfig] = useState<Configurator | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchConfigurators = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/product-configurator')
        if (res.ok) {
          const data = await res.json()
          const configs = data.configurators || []
          setConfigurators(configs)
          if (configs.length > 0) {
            setSelectedConfig(configs[0])
            const initialOptions: Record<string, string> = {}
            Object.entries(configs[0].options || {}).forEach(([key, values]) => {
              if (Array.isArray(values) && values.length > 0) initialOptions[key] = values[0]
            })
            setSelectedOptions(initialOptions)
          }
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    fetchConfigurators()
  }, [])

  const getModifierPrice = (category: string, value: string): number => {
    return priceModifiers[category]?.[value] || 0
  }

  const addOnsPrice = useMemo(() => {
    return addOns.filter(a => selectedAddOns.has(a.id)).reduce((sum, a) => sum + a.price, 0)
  }, [selectedAddOns])

  const optionsPrice = useMemo(() => {
    return Object.entries(selectedOptions).reduce((sum, [key, value]) => sum + getModifierPrice(key, value), 0)
  }, [selectedOptions])

  const totalPrice = (selectedConfig?.basePrice || 0) + optionsPrice + addOnsPrice

  const handleSelectOption = (category: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [category]: value }))
  }

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddToCart = () => {
    if (!selectedConfig) return
    addToCart({
      productId: selectedConfig.productId,
      name: selectedConfig.product.name,
      price: totalPrice,
      quantity: 1,
      imageUrl: selectedConfig.product.imageUrl || null,
    })
    toast.success('Custom product added to cart!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 space-y-4">
          <div className="h-6 w-32 rounded bg-muted animate-pulse" />
          <div className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <motion.div className="min-h-screen bg-background pb-24" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Palette className="h-5 w-5 text-violet-500" /> Product Configurator
            </h1>
          </div>
          {selectedConfig?.totalCombinations && (
            <Badge className="bg-violet-500/10 text-violet-500 text-[9px]">
              {selectedConfig.totalCombinations} combos
            </Badge>
          )}
        </div>
      </div>

      {/* Configurator Selector */}
      {configurators.length > 1 && (
        <div className="px-4 mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {configurators.map(config => (
            <button
              key={config.id}
              onClick={() => {
                setSelectedConfig(config)
                const initialOptions: Record<string, string> = {}
                Object.entries(config.options || {}).forEach(([key, values]) => {
                  if (Array.isArray(values) && values.length > 0) initialOptions[key] = values[0]
                })
                setSelectedOptions(initialOptions)
                setSelectedAddOns(new Set())
              }}
              className={`rounded-xl border px-3 py-2 text-xs whitespace-nowrap transition-all ${
                selectedConfig?.id === config.id ? 'border-violet-500 bg-violet-500/5 text-violet-500' : 'border-border/50 text-muted-foreground'
              }`}
            >
              {config.product?.name || 'Config'}
            </button>
          ))}
        </div>
      )}

      {/* Live Preview */}
      <div className="mx-4 mt-3">
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-card"
          layout
        >
          <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-violet-500/10 to-purple-500/5">
            {selectedConfig?.product?.imageUrl ? (
              <img src={selectedConfig.product.imageUrl} alt={selectedConfig.product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="text-center">
                <Package className="h-16 w-16 mx-auto text-violet-500/20" />
                <p className="text-xs text-muted-foreground mt-2">Live Preview</p>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card to-transparent p-4 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">{selectedConfig?.product?.name || 'Custom Product'}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  {Object.entries(selectedOptions).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-[9px] border-border/30">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
              <motion.span
                key={totalPrice}
                className="text-lg font-bold text-foreground"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {formatPrice(totalPrice)}
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Option Selectors */}
      <div className="px-4 mt-4 space-y-4">
        {Object.entries(selectedConfig?.options || {}).map(([category, values]) => {
          if (!Array.isArray(values)) return null
          const Icon = optionIcons[category] || Star
          return (
            <motion.div
              key={category}
              className="rounded-2xl border border-border/50 bg-card p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 capitalize">
                  <Icon className="h-3.5 w-3.5 text-violet-500" /> {category}
                </h4>
                <span className="text-[10px] text-muted-foreground">{values.length} options</span>
              </div>

              {category === 'color' ? (
                <div className="flex gap-2 flex-wrap">
                  {values.map(value => {
                    const swatch = colorSwatches.find(s => s.name === value)
                    const isSelected = selectedOptions[category] === value
                    const modPrice = getModifierPrice(category, value)
                    return (
                      <button
                        key={value}
                        onClick={() => handleSelectOption(category, value)}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className={`h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center ${
                          isSelected ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-border/50'
                        }`} style={{ backgroundColor: swatch?.hex || '#888' }}>
                          {isSelected && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                        </div>
                        <span className="text-[9px] text-muted-foreground text-center max-w-[60px] truncate">{value}</span>
                        {modPrice > 0 && <span className="text-[9px] text-violet-500">+{formatPrice(modPrice)}</span>}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {values.map(value => {
                    const isSelected = selectedOptions[category] === value
                    const modPrice = getModifierPrice(category, value)
                    return (
                      <motion.button
                        key={value}
                        onClick={() => handleSelectOption(category, value)}
                        className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-violet-500 bg-violet-500/5 text-violet-500'
                            : 'border-border/50 text-muted-foreground hover:border-violet-500/30'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {value}
                        {modPrice !== 0 && (
                          <span className="ml-1 text-[9px]">{modPrice > 0 ? `+${formatPrice(modPrice)}` : formatPrice(modPrice)}</span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Add-ons */}
      <div className="px-4 mt-4">
        <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" /> Add-ons
        </h3>
        <div className="space-y-2">
          {addOns.map(addon => {
            const isSelected = selectedAddOns.has(addon.id)
            return (
              <motion.button
                key={addon.id}
                onClick={() => toggleAddOn(addon.id)}
                className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  isSelected ? 'border-violet-500 bg-violet-500/5' : 'border-border/50 bg-card'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isSelected ? 'bg-violet-500/10' : 'bg-muted/50'}`}>
                  <addon.icon className={`h-4 w-4 ${isSelected ? 'text-violet-500' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{addon.name}</p>
                  <p className="text-[10px] text-muted-foreground">{addon.description}</p>
                </div>
                <span className="text-xs font-medium text-foreground flex-shrink-0">+{formatPrice(addon.price)}</span>
                {isSelected && <Check className="h-4 w-4 text-violet-500 flex-shrink-0" />}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Price Breakdown & Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/30 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-1 text-[11px]">
            <span className="text-muted-foreground">Base price</span>
            <span className="text-foreground">{formatPrice(selectedConfig?.basePrice || 0)}</span>
          </div>
          {optionsPrice > 0 && (
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <span className="text-muted-foreground">Options</span>
              <span className="text-foreground">+{formatPrice(optionsPrice)}</span>
            </div>
          )}
          {addOnsPrice > 0 && (
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <span className="text-muted-foreground">Add-ons</span>
              <span className="text-foreground">+{formatPrice(addOnsPrice)}</span>
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">Total</span>
            <motion.span key={totalPrice} className="text-lg font-bold text-foreground" initial={{ scale: 1.05 }} animate={{ scale: 1 }}>
              {formatPrice(totalPrice)}
            </motion.span>
          </div>
          <Button className="w-full gap-2 bg-violet-500 hover:bg-violet-600 text-white" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

