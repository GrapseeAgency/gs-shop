'use client'

import { Suspense } from 'react'
import { ContactView } from '@/components/shop/contact-view'

function PageContent() {
  return <ContactView />
}

export default function ContactPage() {
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
