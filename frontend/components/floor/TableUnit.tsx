"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"

interface TableUnitProps {
  table: {
    id: string
    label: string
    capacity: number
    shape: 'round' | 'square' | 'rectangle' | 'booth'
    zone: string
    status: 'free' | 'reserved' | 'occupied' | 'cleaning' | 'maintenance'
    x?: number
    y?: number
    currentOrderId?: string | null
  }
  onPress?: (tableId: string) => void
  mode?: 'design' | 'live'
  className?: string
}

const statusColors = {
  free: 'bg-status-success border-status-success text-white',
  reserved: 'bg-status-info border-status-info text-white',
  occupied: 'bg-status-danger border-status-danger text-white',
  cleaning: 'bg-status-cleaning border-status-cleaning text-gray-900',
  maintenance: 'bg-status-neutral border-status-neutral text-white',
}

const statusColorsLight = {
  free: 'bg-status-success/10 border-status-success text-status-success',
  reserved: 'bg-status-info/10 border-status-info text-status-info',
  occupied: 'bg-status-danger/10 border-status-danger text-status-danger',
  cleaning: 'bg-status-cleaning/10 border-status-cleaning text-status-cleaning',
  maintenance: 'bg-status-neutral/10 border-status-neutral text-status-neutral',
}

const shapeStyles = {
  round: 'rounded-full',
  square: 'rounded-lg',
  rectangle: 'rounded-lg aspect-[2/1]',
  booth: 'rounded-lg',
}

export function TableUnit({ table, onPress, mode = 'live', className }: TableUnitProps) {
  const isLive = mode === 'live'
  const colors = isLive ? statusColors : statusColorsLight

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onPress?.(table.id)}
      className={cn(
        "relative flex flex-col items-center justify-center border-2 transition-colors table-unit",
        shapeStyles[table.shape],
        colors[table.status],
        table.shape === 'round' ? 'w-16 h-16' : 
        table.shape === 'rectangle' ? 'w-28 h-14' : 'w-16 h-16',
        className
      )}
      aria-label={`Table ${table.label}, ${table.status}, capacity ${table.capacity}`}
    >
      {/* Table label */}
      <span className="font-bold text-sm">{table.label}</span>
      
      {/* Capacity indicator */}
      <div className="flex items-center gap-0.5 mt-0.5">
        <Users size={10} />
        <span className="text-xs">{table.capacity}</span>
      </div>

      {/* Zone indicator (design mode) */}
      {!isLive && table.zone && (
        <span className="absolute -bottom-5 text-[10px] text-gray-500 whitespace-nowrap">
          {table.zone}
        </span>
      )}

      {/* Status indicator dot (live mode) */}
      {isLive && (
        <motion.div
          initial={false}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn(
            "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
            table.status === 'free' ? 'bg-status-success' :
            table.status === 'reserved' ? 'bg-status-info' :
            table.status === 'occupied' ? 'bg-status-danger' :
            table.status === 'cleaning' ? 'bg-status-cleaning' :
            'bg-status-neutral'
          )}
        />
      )}
    </motion.button>
  )
}
