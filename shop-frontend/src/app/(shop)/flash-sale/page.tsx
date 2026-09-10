'use client'

import { Suspense } from 'react'
import { FlashSalePage } from '@/components/shop/flash-sale-page'

function PageContent() {
  return <FlashSalePage />
}

export default function FlashSalePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <PageContent />
    </Suspense>
  )
}
