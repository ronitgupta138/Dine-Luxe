"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { OTPInput } from "@/components/auth/OTPInput"
import { Button } from "@/components/ui/button"
import { Loader2, Utensils, RefreshCw } from "lucide-react"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(60)
  const router = useRouter()

  const handleVerify = async (value: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Mock verification - in real app, verify OTP with backend
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.push("/customer/home")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    if (countdown > 0) return
    setCountdown(60)
    // Mock resend
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Utensils size={32} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-6">
            <OTPInput
              value={otp}
              onChange={setOtp}
              onComplete={handleVerify}
              error={!!error}
            />

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              onClick={() => handleVerify(otp)}
              disabled={otp.length !== 6 || isLoading}
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>

            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={countdown > 0}
                className="text-sm text-brand-primary hover:text-brand-primary/80 disabled:text-gray-400 transition-colors"
              >
                {countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <RefreshCw size={14} />
                    Resend Code
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
