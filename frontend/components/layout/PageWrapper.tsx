"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageWrapper({ children, className, title, subtitle, action }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("space-y-6", className)}
    >
      {(title || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </motion.div>
  )
}
