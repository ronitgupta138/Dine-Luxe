"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Users, Clock, MapPin, Bell, X, Check, UserCheck } from "lucide-react"
import { QueueEntry, QueueStatus } from "@/hooks/useQueuePosition"

interface QueueCardProps {
  entry: QueueEntry
  onMarkArrived?: (queueId: string) => void
  onAssignTable?: (queueId: string) => void
  onRemove?: (queueId: string) => void
  showActions?: boolean
  isGeoArrived?: boolean
  className?: string
}

const statusConfig: Record<QueueStatus, { label: string; color: string; bg: string }> = {
  waiting: { label: "Waiting", color: "text-gray-600", bg: "bg-gray-100" },
  arrived: { label: "Arrived", color: "text-green-600", bg: "bg-green-100" },
  seated: { label: "Seated", color: "text-blue-600", bg: "bg-blue-100" },
  no_show: { label: "No Show", color: "text-red-600", bg: "bg-red-100" },
  cancelled: { label: "Cancelled", color: "text-gray-400", bg: "bg-gray-100" },
}

function WaitTimer({ createdAt }: { createdAt: string }) {
  const [minutes, setMinutes] = useState(0)

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(createdAt).getTime()
      setMinutes(Math.floor(diff / 60000))
    }

    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [createdAt])

  return (
    <span className="font-mono tabular-nums">
      {minutes}m
    </span>
  )
}

export function QueueCard({
  entry,
  onMarkArrived,
  onAssignTable,
  onRemove,
  showActions = true,
  isGeoArrived = false,
  className,
}: QueueCardProps) {
  const config = statusConfig[entry.status]
  const isActive = entry.status === "waiting" || entry.status === "arrived"

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "relative bg-white rounded-xl border border-gray-100 p-4 shadow-sm",
        isGeoArrived && "ring-2 ring-green-400 shadow-lg shadow-green-100",
        entry.status === "no_show" && "opacity-60",
        className
      )}
    >
      {/* Geo-arrived glow effect */}
      <AnimatePresence>
        {isGeoArrived && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-xl bg-green-400/20 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between">
        {/* Queue Number */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-brand-primary">#{entry.position}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {entry.userName || "Walk-in"}
              </span>
              {entry.source === "pre_booked" && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Booking
                </span>
              )}
              {isGeoArrived && (
                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full animate-pulse">
                  <MapPin size={10} /> Nearby
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users size={14} />
                {entry.partySize}
              </span>
              {entry.phone && (
                <span className="text-xs">{entry.phone.slice(-4)}</span>
              )}
              {entry.status === "waiting" && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  <WaitTimer createdAt={entry.createdAt} />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", config.bg, config.color)}>
          {config.label}
        </span>
      </div>

      {/* Estimated Wait (only for waiting) */}
      {entry.status === "waiting" && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Estimated wait</span>
            <span className="font-medium text-gray-900">
              ~{entry.estimatedWaitMinutes} min
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && isActive && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          {entry.status === "waiting" && onMarkArrived && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onMarkArrived(entry.queueId)}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <Check size={16} />
              Mark Arrived
            </motion.button>
          )}

          {(entry.status === "arrived" || (entry.status === "waiting" && isGeoArrived)) && onAssignTable && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAssignTable(entry.queueId)}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors"
            >
              <UserCheck size={16} />
              Assign Table
            </motion.button>
          )}

          {onRemove && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onRemove(entry.queueId)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Remove from queue"
            >
              <X size={16} />
            </motion.button>
          )}
        </div>
      )}

      {/* No-show countdown bar */}
      {entry.status === "arrived" && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-100 rounded-b-xl overflow-hidden">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 600, ease: "linear" }}
            className="h-full bg-red-400"
          />
        </div>
      )}
    </motion.div>
  )
}
