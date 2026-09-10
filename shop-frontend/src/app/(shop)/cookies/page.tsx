'use client'

import { Suspense } from 'react'
import { CookiePolicyPage } from '@/components/shop/cookie-policy-page'

function PageContent() {
  return <CookiePolicyPage />
}

export default function CookiesPage() {
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
