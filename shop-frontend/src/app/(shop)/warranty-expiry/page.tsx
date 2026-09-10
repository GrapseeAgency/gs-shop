'use client'

import { useState } from 'react'
import { Shield, Clock, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function WarrantyExpiryPage() {
  const [warranties, setWarranties] = useState([
    { product: 'iPhone 15', expiryDate: '2025-09-15', daysLeft: 120 },
    { product: 'MacBook Pro', expiryDate: '2024-12-01', daysLeft: 45 },
  ])

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Warranty Expiry
        </h1>
        <p className="text-muted-foreground">
          Track warranty expiration
        </p>
      </div>

      <div className="space-y-3">
        {warranties.map((w, i) => (
          <Card key={i} className={w.daysLeft < 60 ? 'border-orange-500' : ''}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{w.product}</p>
                  <p className="text-sm text-muted-foreground">Expires: {w.expiryDate}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={w.daysLeft < 60 ? 'destructive' : 'secondary'}>
                  {w.daysLeft} days left
                </Badge>
                {w.daysLeft < 60 && (
                  <p className="text-xs text-orange-600 mt-1">Renew Now</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
