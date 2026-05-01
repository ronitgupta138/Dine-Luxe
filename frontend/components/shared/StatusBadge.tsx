"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
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
  active: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Active' },
  inactive: { bg: 'bg-status-neutral/10', text: 'text-status-neutral', label: 'Inactive' },
  suspended: { bg: 'bg-status-danger/10', text: 'text-status-danger', label: 'Suspended' },
  sold_out: { bg: 'bg-status-danger/10', text: 'text-status-danger', label: 'Sold out' },
  approved: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Approved' },
  flagged: { bg: 'bg-status-warning/10', text: 'text-status-warning', label: 'Flagged' },
  confirmed: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Confirmed' },
  arrived: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Arrived' },
  seated: { bg: 'bg-status-info/10', text: 'text-status-info', label: 'Seated' },
  no_show: { bg: 'bg-status-danger/10', text: 'text-status-danger', label: 'No show' },
  assigned: { bg: 'bg-status-info/10', text: 'text-status-info', label: 'Assigned' },
  picked_up: { bg: 'bg-status-warning/10', text: 'text-status-warning', label: 'Picked up' },
  delivered: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Delivered' },
  // Order statuses
  created: { bg: 'bg-status-info/10', text: 'text-status-info', label: 'Created' },
  confirmed_order: { bg: 'bg-status-info/10', text: 'text-status-info', label: 'Confirmed' },
  pending: { bg: 'bg-status-warning/10', text: 'text-status-warning', label: 'Pending' },
  preparing: { bg: 'bg-status-warning/10', text: 'text-status-warning', label: 'Preparing' },
  ready: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Ready' },
  served: { bg: 'bg-status-info/10', text: 'text-status-info', label: 'Served' },
  paid: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Paid' },
  closed: { bg: 'bg-status-neutral/10', text: 'text-status-neutral', label: 'Closed' },
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
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_')
  const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || {
    ...statusConfig.neutral,
    label: status,
  }
  
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
