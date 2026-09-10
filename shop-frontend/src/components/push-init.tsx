'use client'

import { useEffect } from 'react'
import { initPush } from '@/lib/notification'

/**
 * Client-side component that initialises Capacitor push notifications
 * once when the app first mounts. Safe to render anywhere in the tree.
 */
export function PushInit() {
  useEffect(() => {
    initPush().catch(console.error)
  }, [])
  return null
}
