'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  X,
  Star,
  ChevronDown,
  RotateCcw,
  Check,
  ShoppingCart,
  ArrowUpDown,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet'

export interface FilterState {
  priceRange: [number, number]
  categories: string[]
  minRating: number
  inStockOnly: boolean
  sort: string
  minDiscount: number
}

const defaultFilters: FilterState = {
  priceRange: [0, 5000],
  categories: [],
  minRating: 0,
  inStockOnly: false,
  sort: 'relevance',
  minDiscount: 0,
}

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Reviewed' },
]

const categoryOptions = [
  { id: 'websites', label: 'Websites' },
  { id: 'mobile-apps', label: 'Mobile Apps' },
  { id: 'ecommerce', label: 'E-Commerce' },
  { id: 'saas', label: 'SaaS' },
  { id: 'devops', label: 'DevOps' },
  { id: 'design', label: 'UI/UX Design' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'ai-ml', label: 'AI & ML' },
]

const discountOptions = [
  { value: 10, label: '10%+' },
  { value: 20, label: '20%+' },
  { value: 30, label: '30%+' },
  { value: 50, label: '50%+' },
]

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  totalResults?: number
}

export function AdvancedFilters({ filters, onFiltersChange, totalResults }: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)
  const [sortOpen, setSortOpen] = useState(false)

  const activeCount = useMemo(() => {
    let count = 0
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) count++
    if (filters.categories.length > 0) count += filters.categories.length
    if (filters.minRating > 0) count++
    if (filters.inStockOnly) count++
    if (filters.sort !== 'relevance') count++
    if (filters.minDiscount > 0) count++
    return count
  }, [filters])

  const handleOpen = useCallback(() => {
    setLocalFilters(filters)
    setOpen(true)
  }, [filters])

  const handleApply = () => {
    onFiltersChange(localFilters)
    setOpen(false)
  }

  const handleClear = () => {
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const toggleCategory = (catId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(catId)
        ? prev.categories.filter((c) => c !== catId)
        : [...prev.categories, catId],
    }))
  }

  const currentSortLabel = sortOptions.find((o) => o.value === filters.sort)?.label || 'Relevance'

  return (
    <>
      {/* Filter Trigger Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className="gap-1.5 text-xs h-8 relative"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <Badge className="ml-0.5 h-4 w-4 p-0 flex items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
              {activeCount}
            </Badge>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOpen(!sortOpen)}
          className="gap-1.5 text-xs h-8"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {currentSortLabel}
        </Button>
      </div>

      {/* Sort Dropdown */}
      <AnimatePresence>
        {sortOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSortOpen(false)}
            />
            <motion.div
              className="absolute right-4 z-50 mt-1 w-48 rounded-xl border border-border/50 bg-card p-1 shadow-xl"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onFiltersChange({ ...filters, sort: option.value })
                    setSortOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                    filters.sort === option.value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {filters.sort === option.value && <Check className="h-3 w-3" />}
                  <span className={filters.sort === option.value ? '' : 'ml-5'}>{option.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-h-[85vh] w-full max-w-lg rounded-t-2xl bg-background">
          <SheetHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-base flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Filters
                </SheetTitle>
                <SheetDescription className="text-xs">
                  {totalResults !== undefined ? `${totalResults} results` : 'Refine your search'}
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="h-3 w-3" />
                Clear All
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar -mx-4 px-4 space-y-5 py-2">
            {/* Price Range */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price Range</h4>
              <div className="px-1">
                <Slider
                  value={localFilters.priceRange}
                  min={0}
                  max={5000}
                  step={50}
                  onValueChange={(val) =>
                    setLocalFilters((prev) => ({ ...prev, priceRange: val as [number, number] }))
                  }
                  className="mb-3"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">${localFilters.priceRange[0]}</span>
                  <span className="text-muted-foreground"></span>
                  <span className="font-medium text-foreground">${localFilters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Categories */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</h4>
              <div className="grid grid-cols-2 gap-2">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${
                      localFilters.categories.includes(cat.id)
                        ? 'border-primary/30 bg-primary/10 text-primary font-medium'
                        : 'border-border/50 bg-card text-foreground hover:border-primary/20'
                    }`}
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                      localFilters.categories.includes(cat.id)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30'
                    }`}>
                      {localFilters.categories.includes(cat.id) && <Check className="h-2.5 w-2.5" />}
                    </div>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Rating Filter */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Minimum Rating</h4>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setLocalFilters((prev) => ({
                      ...prev,
                      minRating: prev.minRating === star ? 0 : star,
                    }))}
                    className={`flex items-center gap-0.5 rounded-lg border px-2.5 py-1.5 transition-all ${
                      localFilters.minRating >= star
                        ? 'border-amber-500/30 bg-amber-500/10'
                        : 'border-border/50 hover:border-amber-500/20'
                    }`}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        localFilters.minRating >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/40'
                      }`}
                    />
                    <span className={`text-[10px] font-medium ${
                      localFilters.minRating >= star ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                    }`}>
                      {star}
                    </span>
                  </button>
                ))}
                {localFilters.minRating > 0 && (
                  <span className="text-[10px] text-muted-foreground">& up</span>
                )}
              </div>
            </div>

            <Separator />

            {/* Discount Filter */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discount</h4>
              <div className="flex flex-wrap gap-2">
                {discountOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLocalFilters((prev) => ({
                      ...prev,
                      minDiscount: prev.minDiscount === opt.value ? 0 : opt.value,
                    }))}
                    className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                      localFilters.minDiscount === opt.value
                        ? 'border-primary/30 bg-primary/10 text-primary font-medium'
                        : 'border-border/50 text-foreground hover:border-primary/20'
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Availability */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Availability</h4>
                <p className="text-[10px] text-muted-foreground">Show in-stock items only</p>
              </div>
              <Switch
                checked={localFilters.inStockOnly}
                onCheckedChange={(val) => setLocalFilters((prev) => ({ ...prev, inStockOnly: val }))}
              />
            </div>
          </div>

          <SheetFooter className="flex-row gap-2 border-t border-border/50 pt-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClear}
            >
              Clear All
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleApply}
            >
              Apply Filters
              {activeCount > 0 && (
                <Badge className="ml-1.5 h-4 px-1 bg-primary-foreground/20 text-[9px] text-primary-foreground">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
