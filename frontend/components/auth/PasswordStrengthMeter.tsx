"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

interface Requirement {
  label: string
  test: (password: string) => boolean
}

const requirements: Requirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p) => /[0-9]/.test(p) },
  { label: "Contains special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const passedCount = requirements.filter((req) => req.test(password)).length
  const strength = passedCount / requirements.length

  const getStrengthColor = () => {
    if (strength <= 0.2) return "bg-red-500"
    if (strength <= 0.4) return "bg-orange-500"
    if (strength <= 0.6) return "bg-yellow-500"
    if (strength <= 0.8) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthLabel = () => {
    if (strength <= 0.2) return "Very Weak"
    if (strength <= 0.4) return "Weak"
    if (strength <= 0.6) return "Fair"
    if (strength <= 0.8) return "Good"
    return "Strong"
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", getStrengthColor())}
            initial={{ width: 0 }}
            animate={{ width: `${strength * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <span className={cn(
          "text-xs font-medium",
          strength <= 0.4 ? "text-red-500" :
          strength <= 0.6 ? "text-yellow-600" :
          strength <= 0.8 ? "text-blue-600" :
          "text-green-600"
        )}>
          {getStrengthLabel()}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {requirements.map((req, index) => {
          const passed = req.test(password)
          return (
            <motion.div
              key={req.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-1.5"
            >
              {passed ? (
                <Check size={12} className="text-green-500" />
              ) : (
                <X size={12} className="text-gray-300" />
              )}
              <span className={cn(
                "text-xs",
                passed ? "text-green-600" : "text-gray-400"
              )}>
                {req.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
