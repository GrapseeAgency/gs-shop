'use client'

import { useState } from 'react'
import { Rocket, Check, Download, ShoppingCart, Code, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function NextjsLandingTemplatePage() {
  const [activeTab, setActiveTab] = useState('overview')

  const features = [
    'Next.js 14 with App Router',
    'TypeScript ready',
    'Tailwind CSS styling',
    'Responsive design',
    'SEO optimized',
    'Dark mode support',
    '10 pre-built sections',
    'Framer Motion animations',
    'Form handling with validation',
    'Analytics integration'
  ]

  const techStack = ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Framer Motion']

  const buyTemplate = () => {
    toast.success('Next.js Landing Template added to cart!')
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
            <Layout className="h-24 w-24 text-white" />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500">Bestseller</Badge>
            <Badge variant="secondary">234 sales</Badge>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500"></span>
              <span className="text-sm text-muted-foreground">4.8</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">Next.js Landing Page Template</h1>
          <p className="text-xl text-muted-foreground mb-6">
            A premium, production-ready landing page template built with Next.js 14, TypeScript, and Tailwind CSS. 
            Perfect for startups, SaaS products, and portfolio sites.
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="demo">Live Demo</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">What's Included</h3>
                  <ul className="space-y-2">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="features" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech) => (
                      <Badge key={tech} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="demo" className="mt-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Layout className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <p className="text-muted-foreground mb-4">Live preview opens in new tab</p>
                  <Button>Open Live Demo</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-green-600">1,999</p>
                <p className="text-muted-foreground line-through">4,999</p>
                <Badge className="mt-2 bg-red-500">60% OFF</Badge>
              </div>

              <div className="space-y-3 mb-6">
                <Button className="w-full" size="lg" onClick={buyTemplate}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Buy Now
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Download className="h-5 w-5 mr-2" />
                  Free Preview
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Instant download
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Lifetime updates
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  30-day support
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
