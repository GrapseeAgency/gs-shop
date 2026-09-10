'use client'

import { useState } from 'react'
import { Zap, Crown, FileCode, Award, ShoppingCart, Star, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function DigitalProductsPage() {
  const [products] = useState([
    { id: 1, name: 'Premium SaaS Boilerplate', price: 19999, description: 'Complete SaaS starter with auth, billing, dashboard. Build once, sell forever.', sales: 45, rating: 4.9, tag: 'Bestseller' },
    { id: 2, name: 'Notion Templates Pack', price: 499, description: 'Project management, CRM, content calendar templates', sales: 890, rating: 4.7, tag: 'Popular' },
    { id: 3, name: 'Figma UI Kit Pro', price: 2999, description: '500+ components, auto-layout, variants, design system', sales: 234, rating: 4.8, tag: 'Pro' },
    { id: 4, name: 'Dev Environment Script', price: 499, description: 'One-click setup: Docker, VS Code, Git, Node, all configured', sales: 567, rating: 4.6, tag: null },
    { id: 5, name: 'CI/CD Pipeline Templates', price: 999, description: 'GitHub Actions, GitLab CI, AWS CodePipeline ready', sales: 345, rating: 4.8, tag: null },
  ])

  const buyProduct = (product: any) => {
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Zap className="h-10 w-10 text-yellow-600" />
          Premium Digital Products
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Zero marginal cost. Build once, sell infinite times.
        </p>
      </div>

      <div className="grid gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileCode className="h-12 w-12 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {product.tag && (
                      <Badge className={product.tag === 'Bestseller' ? 'bg-red-500' : 'bg-blue-500'}>
                        <Crown className="h-3 w-3 mr-1" />
                        {product.tag}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{product.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                  <p className="text-muted-foreground mb-4">{product.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>{product.sales} sales</span>
                    <span></span>
                    <span>Instant download</span>
                    <span></span>
                    <span>Lifetime updates</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">{product.price}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" onClick={() => buyProduct(product)}>
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

      <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-8 text-center">
          <Award className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
          <h3 className="text-2xl font-bold mb-2">Certification Programs</h3>
          <p className="text-muted-foreground mb-4">
            Become a Grapsee Certified Developer or Design Pro
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">Certified Developer - 1,999</Button>
            <Button variant="outline">Design Pro - 2,499</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
