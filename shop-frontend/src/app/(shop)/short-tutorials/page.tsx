'use client'

import { useState } from 'react'
import { Play, Clock, Eye, ShoppingCart, Star, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ShortTutorialsPage() {
  const [tutorials] = useState([
    { id: 1, title: 'Deploy Next.js to Vercel', duration: '5 min', views: '12K', price: 99, rating: 4.8 },
    { id: 2, title: 'Setup SSL Certificate', duration: '8 min', views: '8.5K', price: 99, rating: 4.7 },
    { id: 3, title: 'Configure Environment Variables', duration: '4 min', views: '15K', price: 99, rating: 4.9 },
    { id: 4, title: 'Fix Common React Errors', duration: '10 min', views: '22K', price: 99, rating: 4.8 },
    { id: 5, title: 'Optimize Images for Web', duration: '6 min', views: '9K', price: 99, rating: 4.6 },
    { id: 6, title: 'Setup Dark Mode', duration: '7 min', views: '18K', price: 99, rating: 4.9 },
  ])

  const buyTutorial = (tutorial: any) => {
    toast.success(`${tutorial.title} added to cart!`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Video className="h-10 w-10 text-red-600" />
          Bite-Sized Tutorials
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Quick tutorials. Big impact. 99 each.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id} className="group hover:shadow-lg transition-all">
            <div className="h-40 bg-gradient-to-br from-red-100 to-orange-100 rounded-t-lg flex items-center justify-center relative">
              <Play className="h-12 w-12 text-red-600" />
              <Badge className="absolute bottom-2 right-2 bg-black text-white">
                <Clock className="h-3 w-3 mr-1" />
                {tutorial.duration}
              </Badge>
            </div>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-2">{tutorial.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{tutorial.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{tutorial.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-green-600">{tutorial.price}</p>
                <Button size="sm" onClick={() => buyTutorial(tutorial)}>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Buy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-gradient-to-r from-red-50 to-orange-50">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Bundle Deal</h3>
          <p className="text-muted-foreground mb-4">
            Get all 6 tutorials for just 399 (Save 195)
          </p>
          <Button size="lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Buy Complete Bundle
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
