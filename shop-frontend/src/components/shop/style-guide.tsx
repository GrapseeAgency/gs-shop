'use client'

import { motion } from 'framer-motion'
import { Palette, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'

const colors = [
  { name: 'Primary', cls: 'bg-primary' },
  { name: 'Secondary', cls: 'bg-secondary' },
  { name: 'Muted', cls: 'bg-muted' },
  { name: 'Destructive', cls: 'bg-destructive' },
]

export function StyleGuidePage() {
  const { goBack } = useShopRouter()
  return (
    <motion.div className="px-4 py-6 pb-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2"><Palette className="h-5 w-5 text-primary" />Style Guide</h1>
      </div>
      <div className="space-y-6">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Colors</h2>
          <div className="flex gap-3">
            {colors.map(c => <div key={c.name} className="flex flex-col items-center gap-1"><div className={`h-12 w-12 rounded-xl ${c.cls}`} /><span className="text-[10px] text-muted-foreground">{c.name}</span></div>)}
          </div>
        </section>
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Buttons</h2>
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </section>
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

