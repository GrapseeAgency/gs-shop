'use client'

import { useState } from 'react'
import { Settings, Check, ChevronRight, ShoppingCart, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ServiceConfiguratorPage() {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<{
    serviceType: string
    pages: string[]
    features: string[]
    designStyle: string
  }>({
    serviceType: '',
    pages: [],
    features: [],
    designStyle: ''
  })
  const [price, setPrice] = useState(4999)

  const services = [
    { id: 'website', name: 'Website', basePrice: 4999 },
    { id: 'webapp', name: 'Web Application', basePrice: 14999 },
    { id: 'mobile', name: 'Mobile App', basePrice: 24999 },
    { id: 'ecommerce', name: 'E-commerce', basePrice: 9999 }
  ]

  const pageOptions = [
    { id: 'home', name: 'Home', price: 0 },
    { id: 'about', name: 'About', price: 500 },
    { id: 'contact', name: 'Contact', price: 500 },
    { id: 'blog', name: 'Blog', price: 1500 },
    { id: 'portfolio', name: 'Portfolio', price: 1000 },
    { id: 'services', name: 'Services', price: 800 }
  ]

  const featureOptions = [
    { id: 'auth', name: 'User Authentication', price: 2000 },
    { id: 'cms', name: 'Content Management', price: 3000 },
    { id: 'payment', name: 'Payment Integration', price: 2500 },
    { id: 'seo', name: 'SEO Optimization', price: 1500 },
    { id: 'analytics', name: 'Analytics Dashboard', price: 1000 },
    { id: 'chat', name: 'Live Chat', price: 1200 }
  ]

  const togglePage = (pageId: string, pagePrice: number) => {
    const newPages = config.pages.includes(pageId)
      ? config.pages.filter(p => p !== pageId)
      : [...config.pages, pageId]
    setConfig({ ...config, pages: newPages })
    setPrice(config.pages.includes(pageId) ? price - pagePrice : price + pagePrice)
  }

  const toggleFeature = (featureId: string, featurePrice: number) => {
    const newFeatures = config.features.includes(featureId)
      ? config.features.filter(f => f !== featureId)
      : [...config.features, featureId]
    setConfig({ ...config, features: newFeatures })
    setPrice(config.features.includes(featureId) ? price - featurePrice : price + featurePrice)
  }

  const checkout = () => {
    toast.success(`Service configured! Total: ${price}`)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Settings className="h-10 w-10 text-blue-600" />
          Service Configurator
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Build your perfect service, see live pricing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Step {step} of 4</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">What do you need?</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setConfig({ ...config, serviceType: service.id })
                          setPrice(service.basePrice)
                          setStep(2)
                        }}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          config.serviceType === service.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-bold">{service.name}</p>
                        <p className="text-sm text-muted-foreground">Starting {service.basePrice}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select Pages</h3>
                  <div className="space-y-2">
                    {pageOptions.map((page) => (
                      <div key={page.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={config.pages.includes(page.id)}
                            onCheckedChange={() => togglePage(page.id, page.price)}
                          />
                          <span>{page.name}</span>
                        </div>
                        <Badge>+{page.price}</Badge>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" onClick={() => setStep(3)}>Continue</Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Add Features</h3>
                  <div className="space-y-2">
                    {featureOptions.map((feature) => (
                      <div key={feature.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={config.features.includes(feature.id)}
                            onCheckedChange={() => toggleFeature(feature.id, feature.price)}
                          />
                          <span>{feature.name}</span>
                        </div>
                        <Badge variant="secondary">+{feature.price}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                    <Button className="flex-1" onClick={() => setStep(4)}>Review</Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Review Your Configuration</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p><strong>Service:</strong> {services.find(s => s.id === config.serviceType)?.name}</p>
                    <p><strong>Pages:</strong> {config.pages.length} selected</p>
                    <p><strong>Features:</strong> {config.features.length} selected</p>
                  </div>
                  <Button className="w-full" size="lg" onClick={checkout}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Checkout {price}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-bold">Live Price</span>
              </div>
              <p className="text-4xl font-bold text-blue-600">{price}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {config.pages.length} pages  {config.features.length} features
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
