'use client'

import { Suspense } from 'react'
import { ProductConfiguratorPage } from '@/components/shop/product-configurator-page'

export default function ProductConfiguratorRoute() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <ProductConfiguratorPage />
    </Suspense>
  )
}
