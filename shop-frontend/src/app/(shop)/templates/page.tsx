'use client'

import { useState } from 'react'
import { Layout, ShoppingCart, Star, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function TemplatesPage() {
  const [templates] = useState([
    { id: 1, name: 'Next.js Landing Page', price: 1999, sales: 234, rating: 4.8, tech: 'Next.js 14', downloads: 1200 },
    { id: 2, name: 'E-commerce Starter Kit', price: 4999, sales: 89, rating: 4.9, tech: 'Next.js + Prisma', downloads: 450 },
    { id: 3, name: 'Portfolio Template', price: 999, sales: 567, rating: 4.7, tech: 'React + Tailwind', downloads: 2100 },
    { id: 4, name: 'Admin Dashboard', price: 3999, sales: 123, rating: 4.8, tech: 'Next.js + shadcn', downloads: 680 },
    { id: 5, name: 'SaaS Boilerplate', price: 9999, sales: 45, rating: 4.9, tech: 'Full Stack', downloads: 230 },
  ])

  const buyTemplate = (template: any) => {
    toast.success(`${template.name} added to cart!`)
  }

  const previewTemplate = (template: any) => {
    toast.success(`Opening preview for ${template.name}`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Layout className="h-10 w-10 text-blue-600" />
          Templates & Starters
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Premium templates for developers. Build once, sell infinite times.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-xl transition-all">
            <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
              <Layout className="h-16 w-16 text-blue-600 opacity-50" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{template.tech}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{template.rating}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {template.sales} sales  {template.downloads} downloads
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-green-600">{template.price}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => previewTemplate(template)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" onClick={() => buyTemplate(template)}>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Buy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
