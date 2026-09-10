'use client'

import { Suspense } from 'react'
import { EventsView } from '@/components/shop/events-view'

function PageContent() {
  return <EventsView />
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    }>
      <PageContent />
    </Suspense>
  )
}
