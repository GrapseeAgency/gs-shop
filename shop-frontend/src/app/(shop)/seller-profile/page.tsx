'use client'

import { Suspense } from 'react'
import { SellerProfilePage } from '@/components/shop/seller-profile-page'

export default function SellerProfile() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <SellerProfilePage />
    </Suspense>
  )
}
