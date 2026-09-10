'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { OrderSuccess } from '@/components/shop/order-success'
import { useShopStore } from '@/lib/store'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const { setLastOrderId } = useShopStore()

  useEffect(() => {
    if (orderId) {
      setLastOrderId(orderId)
    }
  }, [orderId, setLastOrderId])

  return <OrderSuccess />
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  )
}
