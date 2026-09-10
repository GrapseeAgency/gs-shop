'use client'

import { useState } from 'react'
import { FileText, Layout, CheckSquare, DollarSign, Users, ShoppingCart, Download, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function NotionTemplatesPage() {
  const [templates] = useState([
    { id: 1, name: 'Project Management Hub', price: 499, sales: 567, rating: 4.8, pages: 12, description: 'Complete project tracking with timelines, tasks, and team collaboration' },
    { id: 2, name: 'CRM Database', price: 499, sales: 432, rating: 4.7, pages: 8, description: 'Customer relationship management with deals, contacts, and interactions' },
    { id: 3, name: 'Content Calendar', price: 299, sales: 890, rating: 4.9, pages: 6, description: 'Social media and blog content planning with publish schedule' },
    { id: 4, name: 'Finance Tracker', price: 399, sales: 345, rating: 4.6, pages: 10, description: 'Personal or business finance tracking with budgets and reports' },
    { id: 5, name: 'Habit Tracker', price: 199, sales: 1234, rating: 4.8, pages: 4, description: 'Daily habits, goals, and progress visualization' },
  ])

  const buyTemplate = (template: any) => {
    toast.success(`${template.name} added to cart!`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <FileText className="h-10 w-10 text-gray-800" />
          Notion Templates
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Ready-to-use Notion workspaces. Duplicate and start.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-all">
            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg p-4">
              <div className="grid grid-cols-2 gap-2 h-full">
                <div className="bg-white rounded p-2"><Layout className="h-4 w-4" /></div>
                <div className="bg-white rounded p-2"><CheckSquare className="h-4 w-4" /></div>
                <div className="bg-white rounded p-2"><DollarSign className="h-4 w-4" /></div>
                <div className="bg-white rounded p-2"><Users className="h-4 w-4" /></div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{template.pages} pages</Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-sm">{template.rating}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{template.price}</p>
                  <p className="text-xs text-muted-foreground">{template.sales} sold</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => buyTemplate(template)}>
                    <ShoppingCart className="h-4 w-4" />
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
