'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

export function SeasonalPage() {
  const { goBack, goCategory } = useShopRouter()
  return (
    <motion.div className="px-4 py-6 pb-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-lg font-bold text-foreground">Seasonal Picks</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Coming Soon</h2>
        <p className="text-sm text-muted-foreground max-w-xs">Seasonal collections and limited-time offers will appear here.</p>
        <Button onClick={() => goCategory()} className="bg-primary text-primary-foreground">Browse Products</Button>
      </div>
    </motion.div>
  )
}
