'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ruler, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface SizeGuideProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategory?: 'clothing' | 'shoes' | 'accessories'
}

interface SizeGuideData {
  title: string
  description: string
  columns: string[]
  rows: string[][]
  howToMeasure: { step: string; detail: string }[]
}

const fallbackGuides: Record<string, SizeGuideData> = {
  clothing: {
    title: 'Clothing Size Guide',
    description: 'Find your perfect fit with our clothing size chart',
    columns: ['Size', 'US', 'UK', 'EU', 'Chest (cm)', 'Waist (cm)', 'Hip (cm)'],
    rows: [
      ['XS', '0-2', '4-6', '32-34', '78-82', '60-64', '86-90'],
      ['S', '4-6', '8-10', '36-38', '82-86', '64-68', '90-94'],
      ['M', '8-10', '12-14', '40-42', '86-90', '68-72', '94-98'],
      ['L', '12-14', '16-18', '44-46', '90-94', '72-76', '98-102'],
      ['XL', '16-18', '20-22', '48-50', '94-98', '76-80', '102-106'],
      ['XXL', '20-22', '24-26', '52-54', '98-102', '80-84', '106-110'],
    ],
    howToMeasure: [
      { step: 'Chest', detail: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
      { step: 'Waist', detail: 'Measure around the narrowest part of your waist, keeping the tape comfortably loose.' },
      { step: 'Hip', detail: 'Stand with feet together and measure around the fullest part of your hip.' },
    ],
  },
  shoes: {
    title: 'Shoe Size Guide',
    description: 'Find the right shoe size for your feet',
    columns: ['US', 'UK', 'EU', 'CM', 'Inches'],
    rows: [
      ['5', '2.5', '35', '22', '8.5"'],
      ['6', '3.5', '36', '23', '9"'],
      ['7', '4.5', '37', '23.5', '9.25"'],
      ['8', '5.5', '38', '24.5', '9.5"'],
      ['9', '6.5', '39-40', '25', '9.75"'],
      ['10', '7.5', '41', '26', '10.25"'],
      ['11', '8.5', '42', '27', '10.5"'],
      ['12', '9.5', '43', '27.5', '10.75"'],
    ],
    howToMeasure: [
      { step: 'Length', detail: 'Stand on a piece of paper, trace your foot, then measure from heel to longest toe.' },
      { step: 'Width', detail: 'Measure the widest part of your foot across the ball area.' },
    ],
  },
  accessories: {
    title: 'Accessories Size Guide',
    description: 'Ring, bracelet, and belt sizes',
    columns: ['Size', 'US', 'UK', 'EU', 'CM / Inches'],
    rows: [
      ['Ring XS', '5', 'J', '48', '4.8 cm'],
      ['Ring S', '6', 'L', '51', '5.1 cm'],
      ['Ring M', '7', 'O', '54', '5.4 cm'],
      ['Ring L', '8', 'Q', '57', '5.7 cm'],
      ['Ring XL', '9', 'S', '60', '6.0 cm'],
      ['Belt S', '28-30', '-', '-', '28-30"'],
      ['Belt M', '32-34', '-', '-', '32-34"'],
      ['Belt L', '36-38', '-', '-', '36-38"'],
    ],
    howToMeasure: [
      { step: 'Ring', detail: 'Wrap a strip of paper around your finger, mark the overlap, and measure the length.' },
      { step: 'Belt', detail: 'Measure around your waist where you normally wear your belt.' },
    ],
  },
}

function cmToInches(cm: string): string {
  const num = parseFloat(cm)
  if (isNaN(num)) return cm
  return (num / 2.54).toFixed(1)
}

export function SizeGuide({ open, onOpenChange, defaultCategory = 'clothing' }: SizeGuideProps) {
  const [guides, setGuides] = useState<Record<string, SizeGuideData>>(fallbackGuides)
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm')
  const [activeTab, setActiveTab] = useState(defaultCategory)

  useEffect(() => {
    fetch('/api/size-guides')
      .then((res) => res.json())
      .then((data) => {
        if (data.guides) setGuides(data.guides)
      })
      .catch(() => {
        // Use fallback data
      })
  }, [])

  const currentGuide = guides[activeTab]

  const convertRow = (row: string[], columns: string[]) => {
    if (unit === 'inches') {
      return row.map((cell, i) => {
        if (columns[i]?.includes('(cm)')) {
          const range = cell.split('-')
          if (range.length === 2) {
            return `${cmToInches(range[0])}-${cmToInches(range[1])}`
          }
          return cmToInches(cell)
        }
        return cell
      })
    }
    return row
  }

  const convertedColumns = unit === 'inches' && currentGuide
    ? currentGuide.columns.map((col) => col.replace('(cm)', '(in)'))
    : currentGuide?.columns

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[85vh] w-full max-w-lg rounded-t-2xl bg-background px-0">
        <SheetHeader className="px-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Ruler className="h-4 w-4 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-base text-foreground">Size Guide</SheetTitle>
                <SheetDescription className="text-xs">Find your perfect fit</SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
              <button
                onClick={() => setUnit('cm')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  unit === 'cm' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                cm
              </button>
              <button
                onClick={() => setUnit('inches')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  unit === 'inches' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                inches
              </button>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "clothing" | "shoes" | "accessories")} className="flex-1">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="clothing" className="text-xs">Clothing</TabsTrigger>
              <TabsTrigger value="shoes" className="text-xs">Shoes</TabsTrigger>
              <TabsTrigger value="accessories" className="text-xs">Accessories</TabsTrigger>
            </TabsList>
          </div>

          {['clothing', 'shoes', 'accessories'].map((cat) => {
            const guide = guides[cat]
            if (!guide) return null
            return (
              <TabsContent key={cat} value={cat} className="mt-2">
                <div className="overflow-x-auto px-4 custom-scrollbar">
                  <table className="w-full min-w-[320px] border-collapse text-xs">
                    <thead>
                      <tr>
                        {convertedColumns?.map((col, i) => (
                          <th
                            key={i}
                            className="border-b border-border/50 bg-muted/50 px-2 py-2 text-left font-semibold text-foreground whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {guide.rows.map((row, rowIdx) => (
                        <motion.tr
                          key={rowIdx}
                          className="border-b border-border/20 hover:bg-primary/5 transition-colors"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: rowIdx * 0.03 }}
                        >
                          {convertRow(row, guide.columns).map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className={`px-2 py-2 whitespace-nowrap ${
                                cellIdx === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* How to Measure */}
                <div className="mt-4 px-4">
                  <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Ruler className="h-3.5 w-3.5 text-primary" />
                    How to Measure
                  </h4>
                  <div className="space-y-2">
                    {guide.howToMeasure.map((item, i) => (
                      <div
                        key={i}
                        className="flex gap-3 rounded-xl bg-muted/30 p-3"
                      >
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{item.step}</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>

        <div className="mt-4 px-4 pb-4">
          <p className="text-center text-[10px] text-muted-foreground">
            Measurements may vary slightly between brands. When in doubt, size up.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
