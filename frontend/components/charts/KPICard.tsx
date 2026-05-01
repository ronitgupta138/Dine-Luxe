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
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  const percentChange = previousValue !== undefined 
    ? ((value - previousValue) / previousValue) * 100 
    : undefined

  const formatValue = (val: number) => {
    if (format === 'currency') {
      return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
    }
    if (format === 'percentage') {
      return `${val.toFixed(decimals)}%`
    }
    return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  useEffect(() => {
    if (!isInView) return

    const duration = 800
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = startValue + (value - startValue) * eased
      
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={cn(
        "bg-white rounded-xl border border-gray-100 p-5 shadow-sm",
        className
      )}
    >
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      
      <div className="flex items-end justify-between mt-2">
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-lg text-gray-400">{prefix}</span>}
          <motion.span 
            className="text-3xl font-bold text-gray-900"
            key={value}
          >
            {formatValue(displayValue)}
          </motion.span>
          {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
        </div>

        {percentChange !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            percentChange > 0 ? "text-green-600" : 
            percentChange < 0 ? "text-red-600" : "text-gray-500"
          )}>
            {percentChange > 0 ? <TrendingUp size={16} /> : 
             percentChange < 0 ? <TrendingDown size={16} /> : <Minus size={16} />}
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
    </motion.div>
  )
}
