"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPICardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  previousValue?: number
  format?: 'number' | 'currency' | 'percentage'
  decimals?: number
  sparklineData?: number[]
  className?: string
}

export function KPICard({ 
  title, 
  value, 
  prefix = '', 
  suffix = '', 
  previousValue,
  format = 'number',
  decimals = 0,
  sparklineData,
  className 
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  const percentChange = previousValue !== undefined 
    ? ((value - previousValue) / previousValue) * 100 
    : undefined

  const formatValue = (val: number) => {
    if (format === 'currency') {
      return `${val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
    }
    if (format === 'percentage') {
      return `${val.toFixed(decimals)}%`
    }
    return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  return (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">{title}</p>
      
      <div className="flex items-end justify-between mt-3">
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-xl font-bold text-gray-700">{prefix}</span>}
          <span className="text-3xl font-extrabold text-gray-950 tracking-tight">
            {formatValue(displayValue)}
          </span>
          {suffix && <span className="text-sm font-semibold text-gray-500">{suffix}</span>}
        </div>

        {percentChange !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full",
            percentChange >= 0 ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
          )}>
            {percentChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(percentChange).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-3 h-8">
          <svg 
            viewBox={`0 0 ${sparklineData.length - 1} 100`} 
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <polyline
              fill="none"
              stroke={percentChange !== undefined && percentChange >= 0 ? "#1E7E34" : "#C0392B"}
              strokeWidth="2"
              points={sparklineData.map((d, i) => {
                const max = Math.max(...sparklineData)
                const min = Math.min(...sparklineData)
                const range = max - min || 1
                const y = 100 - ((d - min) / range) * 80 - 10
                return `${i},${y}`
              }).join(' ')}
            />
          </svg>
        </div>
      )}
    </div>
  )
}
