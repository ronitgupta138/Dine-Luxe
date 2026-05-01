"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Users, Clock, MapPin, Check, X } from "lucide-react"

interface QueueEntryCardProps {
  entry: {
    id: string
    queueNumber: number
    partySize: number
    customerName?: string
    status: 'waiting' | 'arrived' | 'no-show'
    arrivedAt?: string
    estimatedWaitMinutes: number
    isGeoFenced?: boolean
  }
  onMarkArrived?: (entryId: string) => void
  onAssignTable?: (entryId: string) => void
  onMarkNoShow?: (entryId: string) => void
  className?: string
}

export function QueueEntryCard({ 
  entry, 
  onMarkArrived, 
  onAssignTable, 
  onMarkNoShow,
  className 
}: QueueEntryCardProps) {
  const [waitTime, setWaitTime] = useState(entry.estimatedWaitMinutes)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (entry.status !== 'waiting') return
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [entry.status])

  const statusConfig = {
    waiting: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-600',
      label: 'Waiting',
    },
    arrived: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-700',
      label: 'Arrived',
    },
    'no-show': {
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700',
      label: 'No Show',
    },
  }

  const config = statusConfig[entry.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative rounded-xl border-2 p-4",
        config.bg,
        config.border,
        entry.isGeoFenced && entry.status === 'waiting' && "animate-pulse-green",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">
            #{entry.queueNumber}
          </span>
          <span className={cn("text-xs px-2 py-1 rounded-full font-medium", config.badge)}>
            {config.label}
          </span>
        </div>
        {entry.isGeoFenced && entry.status === 'waiting' && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <MapPin size={12} />
            Nearby
          </span>
        )}
      </div>

      {/* Party info */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-gray-700">
          <Users size={16} />
          <span className="font-medium">{entry.partySize} people</span>
        </div>
        {entry.customerName && (
          <span className="text-sm text-gray-600">{entry.customerName}</span>
        )}
      </div>

      {/* Wait time */}
      {entry.status === 'waiting' && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <Clock size={14} />
          <span>Wait: ~{waitTime} min</span>
          {elapsedTime > 0 && (
            <span className="text-gray-400">({elapsedTime} min elapsed)</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        {entry.status === 'waiting' && (
          <>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onMarkArrived?.(entry.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors touch-target"
            >
              <Check size={14} />
              Arrived
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onMarkNoShow?.(entry.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors touch-target"
            >
              <X size={14} />
            </motion.button>
          </>
        )}
        {entry.status === 'arrived' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAssignTable?.(entry.id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors touch-target"
          >
            <Check size={14} />
            Assign Table
          </motion.button>
        )}
      </div>

      {/* No-show countdown bar */}
      {entry.status === 'arrived' && entry.arrivedAt && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 600, ease: "linear" }} // 10 minutes
              className="h-full bg-red-400 rounded-full"
            />
          </div>
          <p className="text-xs text-red-500 mt-1">Auto no-show in 10 min</p>
        </div>
      )}
    </motion.div>
  )
}
