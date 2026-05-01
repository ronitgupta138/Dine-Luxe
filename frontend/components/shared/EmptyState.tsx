"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Inbox, Search, ShoppingCart, Calendar, Utensils } from "lucide-react"

interface EmptyStateProps {
  variant?: 'default' | 'search' | 'cart' | 'bookings' | 'menu'
  icon?: React.ReactNode
  title?: string
  message?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const variantConfig = {
  default: {
    icon: Inbox,
    defaultTitle: 'Nothing here yet',
    defaultMessage: 'This section is currently empty.',
  },
  search: {
    icon: Search,
    defaultTitle: 'No results found',
    defaultMessage: 'Try adjusting your search or filters.',
  },
  cart: {
    icon: ShoppingCart,
    defaultTitle: 'Your cart is empty',
    defaultMessage: 'Add some delicious items to get started.',
  },
  bookings: {
    icon: Calendar,
    defaultTitle: 'No bookings yet',
    defaultMessage: 'Book a table to see your reservations here.',
  },
  menu: {
    icon: Utensils,
    defaultTitle: 'No items available',
    defaultMessage: 'Check back later for new menu items.',
  },
}

export function EmptyState({
  variant = 'default',
  icon,
  title,
  message,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  const resolvedMessage = message || description || config.defaultMessage

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"
      >
        {icon ? <span className="text-3xl leading-none">{icon}</span> : <Icon size={32} className="text-gray-400" />}
      </motion.div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || config.defaultTitle}
      </h3>
      
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        {resolvedMessage}
      </p>

      {action && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
