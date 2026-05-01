"use client"

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  error?: boolean
  disabled?: boolean
  className?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error = false,
  disabled = false,
  className,
}: OTPInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Ensure value is always the right length
  const paddedValue = value.padEnd(length, "").slice(0, length)
  const digits = paddedValue.split("")

  useEffect(() => {
    // Focus the first empty input
    const firstEmptyIndex = digits.findIndex((d) => d === "")
    const indexToFocus = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex
    inputRefs.current[indexToFocus]?.focus()
    setFocusedIndex(indexToFocus)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (index: number, inputValue: string) => {
    if (disabled) return

    // Only allow single digit
    const digit = inputValue.slice(-1)
    if (!/^\d*$/.test(digit)) return

    const newDigits = [...digits]
    newDigits[index] = digit
    const newValue = newDigits.join("")
    onChange(newValue)

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }

    // Call onComplete when all digits are filled
    if (newValue.length === length && onComplete) {
      onComplete(newValue)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === "Backspace") {
      if (digits[index]) {
        // Clear current digit
        const newDigits = [...digits]
        newDigits[index] = ""
        onChange(newDigits.join(""))
      } else if (index > 0) {
        // Move to previous input
        inputRefs.current[index - 1]?.focus()
        setFocusedIndex(index - 1)
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return

    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    if (pastedData) {
      onChange(pastedData)
      const nextIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      setFocusedIndex(nextIndex)

      if (pastedData.length === length && onComplete) {
        onComplete(pastedData)
      }
    }
  }

  const handleFocus = (index: number) => {
    setFocusedIndex(index)
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length }).map((_, index) => (
        <motion.div
          key={index}
          animate={
            error
              ? { x: [0, -8, 8, -4, 4, 0] }
              : focusedIndex === index
              ? { scale: 1.05 }
              : { scale: 1 }
          }
          transition={error ? { duration: 0.4 } : { type: "spring", stiffness: 300, damping: 20 }}
        >
          <input
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={cn(
              "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all",
              "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
              error
                ? "border-red-500 bg-red-50 text-red-600"
                : "border-gray-200 bg-white text-gray-900",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        </motion.div>
      ))}
    </div>
  )
}
