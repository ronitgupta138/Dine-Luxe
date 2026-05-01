"use client"

import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  variant?: 'card' | 'list-item' | 'stat' | 'image' | 'text'
  count?: number
  className?: string
}

export function SkeletonCard({ variant = 'card', count = 1, className }: SkeletonCardProps) {
  const variants = {
    card: (
      <div className={cn("bg-white rounded-xl border border-gray-100 p-4 space-y-3", className)}>
        <div className="skeleton h-40 rounded-lg" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-8 w-20 rounded-lg" />
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      </div>
    ),
    'list-item': (
      <div className={cn("flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100", className)}>
        <div className="skeleton w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
        <div className="skeleton h-8 w-16 rounded-lg" />
      </div>
    ),
    stat: (
      <div className={cn("bg-white rounded-xl border border-gray-100 p-5 space-y-3", className)}>
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-8 w-32 rounded" />
        <div className="skeleton h-2 w-full rounded" />
      </div>
    ),
    image: (
      <div className={cn("bg-white rounded-xl border border-gray-100 overflow-hidden", className)}>
        <div className="skeleton aspect-[4/3]" />
        <div className="p-3 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    ),
    text: (
      <div className={cn("space-y-2", className)}>
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-4 w-4/6 rounded" />
      </div>
    ),
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{variants[variant]}</div>
      ))}
    </>
  )
}
