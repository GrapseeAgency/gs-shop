'use client'

import { Suspense } from 'react'
import { CharityShopPage } from '@/components/shop/charity-shop-page'

function PageContent() {
  return <CharityShopPage />
}

export default function CharityShopPageWrapper() {
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
