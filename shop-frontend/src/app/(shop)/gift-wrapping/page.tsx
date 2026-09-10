'use client'

import { Suspense } from 'react'
import { GiftWrappingPage } from '@/components/shop/gift-wrapping-page'

function PageContent() {
  return <GiftWrappingPage />
}

export default function GiftWrappingPageWrapper() {
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
