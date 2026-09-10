'use client'

import { Suspense } from 'react'
import { OrderTrackingPage } from '@/components/shop/order-tracking-page'

export default function OrderTracking() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <OrderTrackingPage />
    </Suspense>
  )
}
