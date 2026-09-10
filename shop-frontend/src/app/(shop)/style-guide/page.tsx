'use client'

import { Suspense } from 'react'
import { StyleGuidePage } from '@/components/shop/style-guide'

export default function StyleGuide() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <StyleGuidePage />
    </Suspense>
  )
}
