'use client'

import { Suspense } from 'react'
import { ShippingCalculatorPage } from '@/components/shop/shipping-calculator-page'

export default function ShippingCalculator() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <ShippingCalculatorPage />
    </Suspense>
  )
}
