'use client'

import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  className?: string
  count?: number
  type?: 'card' | 'list' | 'text' | 'avatar'
}

export function SkeletonLoader({ 
  className,
  count = 1,
  type = 'card'
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={cn('rounded-lg bg-muted p-4 space-y-3', className)}>
            <div className="h-32 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted-foreground/20 rounded w-1/2 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 bg-muted-foreground/20 rounded w-20 animate-pulse" />
              <div className="h-8 bg-muted-foreground/20 rounded w-20 animate-pulse" />
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className={cn('space-y-2', className)}>
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="h-12 bg-muted rounded animate-pulse" />
          </div>
        )
      
      case 'text':
        return (
          <div className={cn('space-y-2', className)}>
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
          </div>
        )
      
      case 'avatar':
        return (
          <div className={cn('flex items-center gap-3', className)}>
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-3 bg-muted rounded w-16 animate-pulse" />
            </div>
          </div>
        )
      
      default:
        return <div className={cn('h-4 bg-muted rounded animate-pulse', className)} />
    }
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  )
}

// Shimmer effect variant
export function ShimmerLoader({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}
