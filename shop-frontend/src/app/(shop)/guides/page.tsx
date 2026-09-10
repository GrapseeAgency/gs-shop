'use client'

import { useState } from 'react'
import { BookOpen, Download, ShoppingCart, FileText, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function GuidesPage() {
  const [guides] = useState([
    { id: 1, name: 'Next.js Deployment Guide', price: 499, pages: 45, format: 'PDF', sales: 567, rating: 4.8 },
    { id: 2, name: 'DevOps Pipeline Setup', price: 799, pages: 78, format: 'PDF', sales: 234, rating: 4.9 },
    { id: 3, name: 'UI/UX Principles for Devs', price: 599, pages: 62, format: 'PDF', sales: 445, rating: 4.7 },
    { id: 4, name: 'App Store Approval Checklist', price: 299, pages: 25, format: 'PDF', sales: 890, rating: 4.6 },
  ])

  const buyGuide = (guide: any) => {
    toast.success(`${guide.name} added to cart!`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <BookOpen className="h-10 w-10 text-orange-600" />
          Documentation & Guides
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Step-by-step guides and comprehensive documentation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <Card key={guide.id} className="group hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-10 w-10 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{guide.format}</Badge>
                    <Badge variant="secondary">{guide.pages} pages</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{guide.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{guide.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{guide.sales} sold</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-green-600">{guide.price}</p>
                    <Button onClick={() => buyGuide(guide)}>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
