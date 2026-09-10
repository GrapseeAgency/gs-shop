'use client'

import { Suspense } from 'react'
import { AgeVerificationPage } from '@/components/shop/age-verification-page'

export default function VerifyAge() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <AgeVerificationPage />
    </Suspense>
  )
}
