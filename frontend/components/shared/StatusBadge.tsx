"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance' | 'free' | 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

const statusConfig = {
  // Table statuses
  free: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Free' },
  available: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Available' },
  occupied: { bg: 'bg-status-danger/10', text: 'text-status-danger', label: 'Occupied' },
  reserved: { bg: 'bg-status-info/10', text: 'text-status-info', label: 'Reserved' },
  cleaning: { bg: 'bg-status-cleaning/10', text: 'text-status-cleaning', label: 'Cleaning' },
  maintenance: { bg: 'bg-status-neutral/10', text: 'text-status-neutral', label: 'Maintenance' },
  // Order statuses
  pending: { bg: 'bg-status-warning/10', text: 'text-status-warning', label: 'Pending' },
  preparing: { bg: 'bg-status-warning/10', text: 'text-status-warning', label: 'Preparing' },
  ready: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Ready' },
  served: { bg: 'bg-status-info/10', text: 'text-status-info', label: 'Served' },
  paid: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Paid' },
  cancelled: { bg: 'bg-status-danger/10', text: 'text-status-danger', label: 'Cancelled' },
  // Generic statuses
  success: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Success' },
  warning: { bg: 'bg-status-warning/10', text: 'text-status-warning', label: 'Warning' },
  danger: { bg: 'bg-status-danger/10', text: 'text-status-danger', label: 'Danger' },
  info: { bg: 'bg-status-info/10', text: 'text-status-info', label: 'Info' },
  neutral: { bg: 'bg-status-neutral/10', text: 'text-status-neutral', label: 'Neutral' },
}

const sizeConfig = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

export function StatusBadge({ status, size = 'md', className, children }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.neutral
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium capitalize transition-colors',
        config.bg,
        config.text,
        sizeConfig[size],
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.text.replace('text-', 'bg-'))} />
      {children || config.label}
    </span>
  )
}
