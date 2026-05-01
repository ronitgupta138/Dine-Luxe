"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Clock, ChefHat } from "lucide-react"

interface OrderTicketProps {
  order: {
    id: string
    tableLabel: string
    items: Array<{
      name: string
      quantity: number
      notes?: string
    }>
    specialNotes?: string
    createdAt: string
    status: 'pending' | 'preparing' | 'ready'
  }
  onStatusChange?: (orderId: string, newStatus: string) => void
  className?: string
}

export function OrderTicket({ order, onStatusChange, className }: OrderTicketProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isOverdue, setIsOverdue] = useState(false)

  useEffect(() => {
    const createdTime = new Date(order.createdAt).getTime()
    
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - createdTime) / 1000)
      setElapsedTime(elapsed)
      setIsOverdue(elapsed > 900) // 15 minutes = 900 seconds
    }, 1000)

    return () => clearInterval(interval)
  }, [order.createdAt])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const statusConfig = {
    pending: {
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-500/5',
      buttonText: 'Start Cooking',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
      nextStatus: 'preparing',
    },
    preparing: {
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-500/5',
      buttonText: 'Mark Ready',
      buttonColor: 'bg-amber-500 hover:bg-amber-600',
      nextStatus: 'ready',
    },
    ready: {
      borderColor: 'border-green-500',
      bgColor: 'bg-green-500/5',
      buttonText: 'Served',
      buttonColor: 'bg-green-500 hover:bg-green-600',
      nextStatus: 'served',
    },
  }

  const config = statusConfig[order.status]

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative bg-[#1a1a1a] border-2 rounded-xl p-4 text-white",
        config.borderColor,
        isOverdue && order.status === 'preparing' && "animate-pulse-red",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ChefHat size={20} className="text-gray-400" />
          <span className="text-3xl font-bold">{order.tableLabel}</span>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 text-sm font-mono",
          isOverdue && order.status === 'preparing' ? "text-red-400" : "text-gray-400"
        )}>
          <Clock size={14} />
          {formatTime(elapsedTime)}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-lg font-bold text-gray-300 min-w-[24px]">
              {item.quantity}
            </span>
            <div>
              <p className="text-lg font-medium">{item.name}</p>
              {item.notes && (
                <p className="text-sm text-amber-400 mt-0.5">{item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Special notes */}
      {order.specialNotes && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-4">
          <p className="text-sm text-amber-400">{order.specialNotes}</p>
        </div>
      )}

      {/* Status button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onStatusChange?.(order.id, config.nextStatus)}
        className={cn(
          "w-full py-3 rounded-lg font-semibold text-white transition-colors",
          config.buttonColor
        )}
      >
        {config.buttonText}
      </motion.button>

      {/* Overdue indicator */}
      {isOverdue && order.status === 'preparing' && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          OVERDUE
        </div>
      )}
    </motion.div>
  )
}
