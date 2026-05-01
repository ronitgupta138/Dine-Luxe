"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { X, AlertTriangle, AlertCircle, CheckCircle, Info } from "lucide-react"

interface AlertBannerProps {
  type: 'critical' | 'warning' | 'success' | 'info'
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
  className?: string
}

const alertConfig = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: AlertCircle,
    iconColor: 'text-amber-500',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-500',
  },
}

export function AlertBanner({ type, message, action, onDismiss, className }: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const config = alertConfig[type]
  const Icon = config.icon

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss?.(), 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "relative flex items-center gap-3 px-4 py-3 rounded-lg border",
            config.bg,
            config.border,
            className
          )}
        >
          <Icon size={20} className={cn("flex-shrink-0", config.iconColor)} />
          
          <p className={cn("flex-1 text-sm font-medium", config.text)}>
            {message}
          </p>

          {action && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                type === 'critical' ? "bg-red-500 text-white hover:bg-red-600" :
                type === 'warning' ? "bg-amber-500 text-white hover:bg-amber-600" :
                type === 'success' ? "bg-green-500 text-white hover:bg-green-600" :
                "bg-blue-500 text-white hover:bg-blue-600"
              )}
            >
              {action.label}
            </motion.button>
          )}

          {onDismiss && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDismiss}
              className={cn("p-1 rounded-full hover:bg-black/5 transition-colors", config.text)}
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
