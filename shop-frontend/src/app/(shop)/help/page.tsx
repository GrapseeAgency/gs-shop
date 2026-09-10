'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, HelpCircle, Search, Package, Truck, RotateCcw,
  CreditCard, User, ShoppingBag, ChevronDown, ChevronUp,
  MessageCircle, Star, Eye, Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useRouter } from 'next/navigation'

interface HelpCategory {
  id: string
  title: string
  icon: string
  description: string
  articles: Array<{ id: string; title: string; content: string }>
}

interface PopularArticle {
  id: string
  title: string
  category: string
  views: number
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  package: Package,
  truck: Truck,
  'rotate-ccw': RotateCcw,
  'credit-card': CreditCard,
  user: User,
  'shopping-bag': ShoppingBag,
}

export default function HelpPage() {
  const { goBack } = useShopRouter()
  const router = useRouter()
  const [categories, setCategories] = useState<HelpCategory[]>([])
  const [popularArticles, setPopularArticles] = useState<PopularArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)

  const fetchHelp = useCallback(async () => {
    try {
      const res = await fetch('/api/help')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
        setPopularArticles(data.popularArticles || [])
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHelp() }, [fetchHelp])

  const filteredCategories = searchQuery
    ? categories.map((cat) => ({
        ...cat,
        articles: cat.articles.filter(
          (a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((cat) => cat.articles.length > 0)
    : categories

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-sky-400" />
              Help Center
            </h1>
            <p className="text-[11px] text-muted-foreground">Find answers & get support</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* Category Cards */}
      <div className="px-4 mt-4">
        <h3 className="mb-3 text-sm font-bold text-foreground">Browse by Category</h3>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category, index) => {
              const Icon = ICON_MAP[category.icon] || HelpCircle
              return (
                <motion.button
                  key={category.id}
                  className="group flex flex-col items-center rounded-2xl border border-border/50 bg-card p-4 text-center transition-all hover:border-primary/20 hover:shadow-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
                    <Icon className="h-5 w-5 text-sky-400" />
                  </div>
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.title}
                  </p>
                  <p className="mt-0.5 text-[9px] text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                  <Badge variant="outline" className="mt-2 text-[8px] px-1.5 py-0">
                    {category.articles.length} articles
                  </Badge>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* FAQ Accordion for expanded category */}
      <AnimatePresence>
        {expandedCategory && (
          <motion.div
            className="px-4 mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {(() => {
              const cat = categories.find((c) => c.id === expandedCategory)
              if (!cat) return null
              const Icon = ICON_MAP[cat.icon] || HelpCircle
              const articles = searchQuery
                ? cat.articles.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase()))
                : cat.articles

              return (
                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                  <div className="flex items-center gap-2 p-4 border-b border-border/30 bg-sky-500/5">
                    <Icon className="h-5 w-5 text-sky-400" />
                    <h3 className="text-sm font-bold text-foreground flex-1">{cat.title}</h3>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedCategory(null)}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="divide-y divide-border/30">
                    {articles.map((article) => (
                      <div key={article.id}>
                        <button
                          className="flex w-full items-center justify-between p-3.5 text-left"
                          onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                        >
                          <span className="text-xs font-medium text-foreground pr-2">{article.title}</span>
                          {expandedArticle === article.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedArticle === article.id && (
                            <motion.div
                              className="px-3.5 pb-3.5"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                                {article.content}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popular Articles */}
      <div className="px-4 mt-6">
        <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400" />
          Popular Articles
        </h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {popularArticles.map((article, index) => (
              <motion.div
                key={article.id}
                className="flex items-center gap-3 rounded-xl border border-border/30 bg-card p-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-400">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground line-clamp-1">{article.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] px-1 py-0">{article.category}</Badge>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" /> {article.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {/* Contact Support CTA */}
      <div className="px-4">
        <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent p-5 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-sky-400 mb-2" />
          <p className="text-base font-bold text-foreground mb-1">Need More Help?</p>
          <p className="text-xs text-muted-foreground mb-4">Our support team is available 24/7 to assist you</p>
          <div className="flex gap-2 justify-center">
            <Button className="gap-2 bg-sky-500 text-white hover:bg-sky-600" onClick={() => router.push('/contact')}>
              <Phone className="h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
