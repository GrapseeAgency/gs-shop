'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, X, ChevronUp, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

export function CompareFloatingButton() {
  const { compareList, removeFromCompare, clearCompare } = useShopStore()
  const { goCompare } = useShopRouter()
  const [expanded, setExpanded] = useState(false)

  if (compareList.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-20 left-4 z-30 max-w-[280px]"
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {/* Collapsed: floating pill */}
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center gap-2"
            >
              <Button
                className="gap-2 rounded-full shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
                onClick={() => setExpanded(true)}
              >
                <GitCompare className="h-4 w-4" />
                Compare
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-foreground/20 px-1 text-[10px] font-bold">
                  {compareList.length}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 shadow-md backdrop-blur-sm hover:bg-destructive/10 active:scale-90 transition-all"
                onClick={clearCompare}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/20 backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Compare Items</span>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-bold text-primary">
                    {compareList.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-destructive/10 active:scale-90 transition-all"
                    onClick={() => {
                      clearCompare()
                      setExpanded(false)
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-muted active:scale-90 transition-all"
                    onClick={() => setExpanded(false)}
                  >
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Mini list of compared items */}
              <div className="max-h-48 overflow-y-auto p-2">
                {compareList.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-medium text-foreground truncate">
                        {product.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0 rounded-full hover:bg-destructive/10 active:scale-90 transition-all"
                      onClick={() => removeFromCompare(product.id)}
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="border-t border-border/50 p-3 space-y-2">
                <Button
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform"
                  onClick={() => {
                    goCompare()
                    setExpanded(false)
                  }}
                >
                  Compare Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-xs active:scale-[0.98] transition-transform"
                  onClick={() => {
                    clearCompare()
                    setExpanded(false)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  Clear All
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
