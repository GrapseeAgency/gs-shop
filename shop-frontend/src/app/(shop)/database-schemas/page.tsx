'use client'

import { useState } from 'react'
import { Database, Table, Key, Copy, Check, ShoppingCart, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function DatabaseSchemasPage() {
  const [activeTab, setActiveTab] = useState('ecommerce')
  const [copied, setCopied] = useState(false)

  const schemas: Record<string, { name: string; price: number; description: string; code: string }> = {
    ecommerce: {
      name: 'E-commerce Schema',
      price: 499,
      description: 'Products, orders, users, cart, reviews',
      code: `model Product {
  id        String   @id @default(uuid())
  name      String
  price     Decimal
  category  Category @relation(fields: [categoryId], references: [id])
  orders    Order[]
  reviews   Review[]
}

model Order {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  products  Product[]
  total     Decimal
  status    OrderStatus
  createdAt DateTime @default(now())
}`
    },
    saas: {
      name: 'SaaS Schema',
      price: 499,
      description: 'Tenants, subscriptions, billing, teams',
      code: `model Tenant {
  id        String   @id @default(uuid())
  name      String
  users     User[]
  plan      Plan     @relation(fields: [planId], references: [id])
  billing   Billing?
  createdAt DateTime @default(now())
}

model Subscription {
  id        String   @id @default(uuid())
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  status    SubscriptionStatus
  period    SubscriptionPeriod
  price     Decimal
}`
    },
    blog: {
      name: 'Blog Schema',
      price: 499,
      description: 'Posts, authors, categories, comments, tags',
      code: `model Post {
  id        String   @id @default(uuid())
  title     String
  slug      String   @unique
  content   String
  author    Author   @relation(fields: [authorId], references: [id])
  category  Category @relation(fields: [categoryId], references: [id])
  tags      Tag[]
  comments  Comment[]
  published Boolean  @default(false)
  createdAt DateTime @default(now())
}`
    },
  }

  const currentSchema = schemas[activeTab]

  const copyCode = () => {
    navigator.clipboard.writeText(currentSchema.code)
    setCopied(true)
    toast.success('Schema copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const buySchema = () => {
    toast.success(`${currentSchema.name} added to cart!`)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Database className="h-10 w-10 text-blue-600" />
          Database Schema Packs
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Production-ready Prisma schemas. Copy and migrate.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3">
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="saas">SaaS</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                {currentSchema.name}
                <Badge variant="secondary">Prisma</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{currentSchema.description}</p>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">schema.prisma</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400"
                    onClick={copyCode}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap">{currentSchema.code}</pre>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-green-600">{currentSchema.price}</p>
                <Button onClick={buySchema}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Schema
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <FileCode className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h3 className="text-2xl font-bold mb-2">Bundle & Save</h3>
          <p className="text-muted-foreground mb-4">
            Get all 3 schemas for just 999 (Save 498)
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
