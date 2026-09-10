'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseIntersectionObserverReturn {
  ref: (node: Element | null) => void
  isIntersecting: boolean
}

export function useIntersectionObserver(
  options?: IntersectionObserverInit
): UseIntersectionObserverReturn {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [node, setNode] = useState<Element | null>(null)

  useEffect(() => {
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      options
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [node, options?.threshold, options?.root, options?.rootMargin])

  const ref = useCallback((element: Element | null) => {
    setNode(element)
  }, [])

  return { ref, isIntersecting }
}
