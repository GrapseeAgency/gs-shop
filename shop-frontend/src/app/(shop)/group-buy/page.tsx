'use client'

import { Suspense } from 'react'
import { GroupBuyPage } from '@/components/shop/group-buy-page'

function PageContent() {
  return <GroupBuyPage />
}

export default function GroupBuyPageWrapper() {
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
