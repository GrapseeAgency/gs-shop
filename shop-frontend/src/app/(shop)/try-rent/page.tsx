'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, ArrowRight, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const RENTAL_OPTIONS = [
  {
    duration: 1,
    unit: 'day',
    price: 499,
    description: 'Try for 1 day',
    bestFor: 'Quick evaluation'
  },
  {
    duration: 3,
    unit: 'days',
    price: 999,
    description: 'Try for 3 days',
    bestFor: 'Full feature testing',
    popular: true
  },
  {
    duration: 7,
    unit: 'days',
    price: 1499,
    description: 'Try for 7 days',
    bestFor: 'Complete experience'
  }
]

export default function TryRentPage() {
  const [rentals, setRentals] = useState<any[]>([])

  useEffect(() => {
    fetchRentals()
  }, [])

  const fetchRentals = async () => {
    try {
      const res = await fetch('/api/try-before-buy/rental')
      if (res.ok) {
        const data = await res.json()
        setRentals(data.rentals || [])
      }
    } catch (error) {
      console.error('Error fetching rentals:', error)
    }
  }

  const startRental = async (option: any) => {
    toast.success(`Rental option selected: ${option.duration} ${option.unit} for ${option.price}`)
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calendar className="h-8 w-8 text-blue-500" />
          Try Before You Buy
        </h1>
        <p className="text-muted-foreground mt-2">
          Rent products for a few days. Love it? Rental fee goes toward your purchase!
        </p>
      </div>

      {/* How It Works */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium text-sm">1. Choose Duration</p>
              <p className="text-xs text-muted-foreground">1, 3, or 7 days</p>
            </div>
            <div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium text-sm">2. Try It Out</p>
              <p className="text-xs text-muted-foreground">Full access to all features</p>
            </div>
            <div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium text-sm">3. Decide</p>
              <p className="text-xs text-muted-foreground">Buy or return</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rental Options */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {RENTAL_OPTIONS.map((option) => (
          <Card 
            key={option.duration} 
            className={`relative ${option.popular ? 'ring-2 ring-blue-500' : ''}`}
          >
            {option.popular && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{option.price}</p>
              <p className="font-medium mt-2">{option.duration} {option.unit}</p>
              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
              <p className="text-xs text-muted-foreground mt-2">Best for: {option.bestFor}</p>
              <Button 
                className="w-full mt-4" 
                variant={option.popular ? 'default' : 'outline'}
                onClick={() => startRental(option)}
              >
                Select <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Why Try Before You Buy?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-500" />
            <p className="text-sm">Rental fee fully applied to purchase if you decide to buy</p>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-500" />
            <p className="text-sm">Full feature access during trial period</p>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-500" />
            <p className="text-sm">Cancel anytime during trial, no questions asked</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
