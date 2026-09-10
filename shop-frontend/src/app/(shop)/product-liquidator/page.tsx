'use client'

import { useState } from 'react'
import { RefreshCw, Camera, Package, DollarSign, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ProductLiquidatorPage() {
  const [productName, setProductName] = useState('')
  const [condition, setCondition] = useState('good')
  const [age, setAge] = useState('1')
  const [listed, setListed] = useState(false)
  const [estimate, setEstimate] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const getEstimate = async () => {
    setLoading(true)
    
    try {
      const res = await fetch('/api/money-savers/product-liquidator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, condition, age: parseInt(age), photos: [] })
      })
      
      if (res.ok) {
        const data = await res.json()
        setEstimate(data)
        setListed(true)
        toast.success('Listed on 5 platforms!')
      }
    } catch (error) {
      toast.error('Listing failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <RefreshCw className="h-8 w-8 text-green-600" />
          Product Liquidator
        </h1>
        <p className="text-muted-foreground">
          Sell your old products on 5 platforms simultaneously
        </p>
      </div>

      {!listed ? (
        <Card>
          <CardHeader>
            <CardTitle>Sell Your Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <Input 
                placeholder="e.g., iPhone 12, Sofa, Laptop"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Condition</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Age (years)</label>
                <Input 
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>

            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Upload photos (optional but recommended)
              </p>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={getEstimate}
              disabled={loading || !productName}
            >
              {loading ? 'Listing...' : <><Package className="h-4 w-4 mr-2" /> List on All Platforms</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-700">
                {estimate?.estimatedValue}
              </p>
              <p className="text-green-600">Estimated Value</p>
              <Badge className="mt-2 bg-green-500">Listed on 5 platforms</Badge>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {estimate?.listings?.map((listing: any, i: number) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <p className="font-medium">{listing.platform}</p>
                  <p className="text-2xl font-bold">{listing.price}</p>
                  <p className="text-sm text-muted-foreground">{listing.eta}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-600">
                <Truck className="h-5 w-5" />
                <span>Pickup arranged automatically when sold!</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
