'use client'

import { useState } from 'react'
import { Code, Copy, Check, ShoppingCart, Terminal, FileCode, Database, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SnippetsPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const snippets = [
    { id: 1, name: 'Auth in a Box', price: 1999, description: 'Complete auth system: login, signup, forgot password, email verification', tech: 'NextAuth + Prisma', icon: Shield, sales: 234 },
    { id: 2, name: 'Payment Integration Kit', price: 2499, description: 'Stripe and SSLCommerz integration ready to use', tech: 'Stripe API', icon: Terminal, sales: 178 },
    { id: 3, name: 'SEO Optimization Script', price: 999, description: 'Meta tags, sitemap, structured data generator', tech: 'Next.js SEO', icon: FileCode, sales: 456 },
    { id: 4, name: 'Database Schema Pack', price: 499, description: 'E-commerce, SaaS, Blog schemas for Prisma', tech: 'Prisma', icon: Database, sales: 890 },
  ]

  const copyCode = (id: number) => {
    setCopiedId(id)
    toast.success('Code snippet copied!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const buySnippet = (snippet: any) => {
    toast.success(`${snippet.name} added to cart!`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Code className="h-10 w-10 text-green-600" />
          Code Snippets & Utilities
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Production-ready code. Copy, paste, deploy.
        </p>
      </div>

      <div className="grid gap-6">
        {snippets.map((snippet) => {
          const Icon = snippet.icon
          return (
            <Card key={snippet.id} className="group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{snippet.name}</h3>
                      <Badge variant="secondary">{snippet.tech}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{snippet.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {snippet.sales} sales  Instant download
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-2xl font-bold text-green-600">{snippet.price}</p>
                        <Button variant="outline" size="sm" onClick={() => copyCode(snippet.id)}>
                          {copiedId === snippet.id ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          {copiedId === snippet.id ? 'Copied' : 'Preview'}
                        </Button>
                        <Button size="sm" onClick={() => buySnippet(snippet)}>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Buy
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
