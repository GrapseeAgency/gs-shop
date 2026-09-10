'use client'

import { Suspense } from 'react'
import { StudentDiscountPage } from '@/components/shop/student-discount-page'

function PageContent() {
  return <StudentDiscountPage />
}

export default function StudentDiscountPageWrapper() {
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
