'use client'

import { Suspense } from 'react'
import { ProductVideosPage } from '@/components/shop/product-videos-page'

function PageContent() {
  return <ProductVideosPage />
}

export default function ProductVideosPageWrapper() {
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
