"use client"

import { cn } from "@/lib/utils"
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react"

interface SentimentBadgeProps {
  sentiment: 'positive' | 'neutral' | 'negative'
  score?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sentimentConfig = {
  positive: {
    label: 'Positive',
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: ThumbsUp,
  },
  neutral: {
    label: 'Neutral',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: Minus,
  },
  negative: {
    label: 'Negative',
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: ThumbsDown,
  },
}

const sizeConfig = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
}

const iconSizeConfig = {
  sm: 10,
  md: 12,
  lg: 14,
}

export function SentimentBadge({ sentiment, score, size = 'md', className }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bg,
        config.text,
        sizeConfig[size],
        className
      )}
    >
      <Icon size={iconSizeConfig[size]} />
      {config.label}
      {score !== undefined && (
        <span className="opacity-75">({(score * 100).toFixed(0)}%)</span>
      )}
    </span>
  )
}
