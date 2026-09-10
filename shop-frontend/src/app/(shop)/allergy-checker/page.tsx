'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AllergyCheckerPage() {
  const [productName, setProductName] = useState('')
  const [allergies] = useState(['peanuts', 'gluten', 'dairy'])
  const [checked, setChecked] = useState(false)
  const [safe, setSafe] = useState(true)

  const checkProduct = () => {
    setChecked(true)
    setSafe(Math.random() > 0.3)
    if (safe) {
      toast.success('Product is safe for you!')
    } else {
      toast.error('Warning: Contains allergens!')
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <AlertTriangle className="h-8 w-8 text-yellow-600" />
          Allergy Checker
        </h1>
        <p className="text-muted-foreground">
          Profile: "Peanut allergy"  product page: "Contains traces of nuts" alert
        </p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Check Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Enter product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Your allergies:</span>
            {allergies.map((a) => (
              <Badge key={a} variant="destructive">{a}</Badge>
            ))}
          </div>
          <Button className="w-full" onClick={checkProduct}>
            Check for Allergens
          </Button>
        </CardContent>
      </Card>

      {checked && (
        <Card className={safe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {safe ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-600" />
                  <div>
                    <h3 className="text-xl font-bold text-green-800">Safe to Consume</h3>
                    <p className="text-green-700">No allergens detected</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 text-red-600" />
                  <div>
                    <h3 className="text-xl font-bold text-red-800">Allergen Warning!</h3>
                    <p className="text-red-700">Contains: Peanuts, Tree nuts</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
