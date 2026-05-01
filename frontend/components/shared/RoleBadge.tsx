"use client"

import { cn } from "@/lib/utils"
import { Shield, User, ChefHat, Truck, HeadphonesIcon, Crown, Store, Users } from "lucide-react"

interface RoleBadgeProps {
  role: 'super_admin' | 'owner' | 'manager' | 'host' | 'waiter' | 'chef' | 'cashier' | 'customer' | 'delivery_partner' | 'support_agent'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const roleConfig = {
  super_admin: {
    label: 'Super Admin',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    icon: Crown,
  },
  owner: {
    label: 'Owner',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: Store,
  },
  manager: {
    label: 'Manager',
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    icon: Shield,
  },
  host: {
    label: 'Host',
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    icon: Users,
  },
  waiter: {
    label: 'Waiter',
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: User,
  },
  chef: {
    label: 'Chef',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    icon: ChefHat,
  },
  cashier: {
    label: 'Cashier',
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    icon: User,
  },
  customer: {
    label: 'Customer',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: User,
  },
  delivery_partner: {
    label: 'Delivery',
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    icon: Truck,
  },
  support_agent: {
    label: 'Support',
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    icon: HeadphonesIcon,
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

export function RoleBadge({ role, size = 'md', showIcon = true, className }: RoleBadgeProps) {
  const config = roleConfig[role]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium capitalize',
        config.bg,
        config.text,
        sizeConfig[size],
        className
      )}
    >
      {showIcon && <Icon size={iconSizeConfig[size]} />}
      {config.label}
    </span>
  )
}
