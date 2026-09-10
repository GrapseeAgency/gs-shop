'use client'

import { useState } from 'react'
import { VirtualMall } from '@/components/shop/virtual-mall'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function VirtualMallPage() {
  const [selectedStore, setSelectedStore] = useState<string | null>(null)

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />
          3D Virtual Mall
        </h1>
        <p className="text-muted-foreground">
          Walk through our digital marketplace and explore stores in immersive 3D
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3D View */}
        <div className="lg:col-span-3">
          <VirtualMall onStoreSelect={setSelectedStore} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" />
                Navigation
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">Zone A</Button>
                <Button variant="outline" size="sm">Zone B</Button>
                <Button variant="outline" size="sm">Electronics</Button>
                <Button variant="outline" size="sm">Fashion</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Users className="h-4 w-4" />
                Shoppers Online
              </h3>
              <p className="text-2xl font-bold">127</p>
              <p className="text-xs text-muted-foreground">browsing right now</p>
            </CardContent>
          </Card>

          {selectedStore && (
            <Card className="border-primary">
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2">Selected Store</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Store ID: {selectedStore}
                </p>
                <Button className="w-full" size="sm" asChild>
                  <Link href={`/sellers/${selectedStore}`}>
                    Enter Store
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-2">How to Navigate</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li> Use arrow keys or buttons</li>
                <li> Click stores to enter</li>
                <li> Find hidden treasure codes!</li>
                <li> Group shop with friends</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
