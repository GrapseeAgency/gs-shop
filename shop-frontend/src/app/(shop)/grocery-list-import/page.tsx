'use client'

import { useState } from 'react'
import { Camera, Upload, List, ShoppingCart, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function GroceryListImportPage() {
  const [uploading, setUploading] = useState(false)
  const [items, setItems] = useState<any[]>([])

  const uploadList = async () => {
    setUploading(true)
    
    setTimeout(async () => {
      try {
        const res = await fetch('/api/time-savers/grocery-list-import', {
          method: 'POST',
          body: new FormData()
        })
        
        if (res.ok) {
          const data = await res.json()
          setItems(data.matchedItems || [])
          toast.success(`Found ${data.matchedCount} items!`)
        }
      } catch (error) {
        toast.error('Import failed')
      } finally {
        setUploading(false)
      }
    }, 2000)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Camera className="h-8 w-8 text-blue-600" />
          Grocery List Import
        </h1>
        <p className="text-muted-foreground">
          Take a photo of your handwritten list  AI finds all items
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div 
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 cursor-pointer transition-all ${
                uploading ? 'bg-blue-100 animate-pulse' : 'bg-muted hover:bg-muted/80'
              }`}
              onClick={uploadList}
            >
              <Upload className={`h-12 w-12 ${uploading ? 'text-blue-600' : 'text-muted-foreground'}`} />
            </div>
            
            <p className="text-lg font-medium mb-2">
              {uploading ? 'Reading your list...' : 'Tap to Upload List'}
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Take a clear photo of your handwritten grocery list. Our AI will read it and find every item.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Parsed Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">{item.parsed?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.parsed?.quantity}  Confidence: {item.parsed?.confidence}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.matched?.price}</p>
                      <Badge variant="secondary">{item.matched?.name}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4" size="lg">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Cart ({items.reduce((sum, i) => sum + (i.matched?.price || 0), 0)})
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
