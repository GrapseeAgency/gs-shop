'use client'

import { Suspense } from 'react'
import { CustomerPhotosPage } from '@/components/shop/customer-photos-page'

export default function CustomerPhotosRoute() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <CustomerPhotosPage />
    </Suspense>
  )
}
