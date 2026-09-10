'use client'

import { Suspense } from 'react'
import { PriceGuaranteePage } from '@/components/shop/price-guarantee-page'

function PageContent() {
  return <PriceGuaranteePage />
}

export default function PriceGuaranteePageWrapper() {
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
