'use client'

import { useEffect, useState } from 'react'
import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function WarrantyTrackerPage() {
  const [warranties, setWarranties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWarranties()
  }, [])

  const fetchWarranties = async () => {
    try {
      const res = await fetch('/api/lifestyle/warranty-tracker')
      if (res.ok) {
        const data = await res.json()
        setWarranties(data.warranties || [])
      }
    } catch (error) {
      console.error('Error fetching warranties:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded" />
          ))}
        </div>
      </div>
    )
  }

  const active = warranties.filter(w => w.status === 'active')
  const expiring = warranties.filter(w => w.daysLeft <= 30 && w.daysLeft > 0)
  const expired = warranties.filter(w => w.status === 'expired')

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-500" />
          Warranty Tracker
        </h1>
        <p className="text-muted-foreground">
          All your product warranties in one place with expiry alerts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{active.length}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{expiring.length}</p>
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-red-600">{expired.length}</p>
            <p className="text-sm text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Alert */}
      {expiring.length > 0 && (
        <Card className="mb-6 border-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-semibold">{expiring.length} warranties expiring soon</p>
                <p className="text-sm text-muted-foreground">
                  Consider extending or using warranty services before they expire
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warranty List */}
      <div className="space-y-4">
        {warranties.map((warranty) => {
          const isExpiring = warranty.daysLeft <= 30
          const isExpired = warranty.status === 'expired'

          return (
            <Card key={warranty.id} className={isExpired ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{warranty.productName}</h3>
                      {isExpiring && !isExpired && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          Expiring in {warranty.daysLeft} days
                        </Badge>
                      )}
                      {isExpired && <Badge variant="destructive">Expired</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Purchased: {new Date(warranty.purchaseDate).toLocaleDateString()}
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Warranty Progress</span>
                        <span>{warranty.daysLeft} days remaining</span>
                      </div>
                      <Progress 
                        value={warranty.progress || 0} 
                        className={isExpiring ? 'text-amber-500' : ''}
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    {!isExpired && (
                      <Button variant="outline" size="sm">
                        Extend Warranty
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {warranties.length === 0 && (
        <Card className="p-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No warranties tracked yet</p>
          <p className="text-sm text-muted-foreground">
            Your warranties will appear here automatically when you make purchases
          </p>
        </Card>
      )}
    </div>
  )
}
