'use client'

import { Suspense } from 'react'
import { StorePickupPage } from '@/components/shop/store-pickup-page'

export default function StorePickup() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <StorePickupPage />
    </Suspense>
  )
}
