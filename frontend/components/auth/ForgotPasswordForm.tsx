"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getBrowserSupabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OTPInput } from "./OTPInput"
import { PasswordStrengthMeter } from "./PasswordStrengthMeter"
import { Loader2, Mail, Lock, ArrowLeft, Check, RefreshCw } from "lucide-react"

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
})

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type EmailForm = z.infer<typeof emailSchema>
type ResetForm = z.infer<typeof resetSchema>

type Step = 'email' | 'otp' | 'reset' | 'success'

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  })

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const startCountdown = () => {
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOTP = async (data: EmailForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = await getBrowserSupabase()
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (otpError) throw otpError

      setEmail(data.email)
      setStep('otp')
      startCountdown()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (value: string) => {
    setOtp(value)
    if (value.length === 6) {
      setStep('reset')
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    setIsLoading(true)
    setError(null)

    try {
      const supabase = await getBrowserSupabase()
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (otpError) throw otpError

      startCountdown()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (data: ResetForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = await getBrowserSupabase()
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) throw updateError

      setStep('success')
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {step === 'email' && (
          <motion.div
            key="email"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Forgot Password?</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your email and we'll send you a verification code
              </p>
            </div>

            <form onSubmit={emailForm.handleSubmit(handleSendOTP)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...emailForm.register("email")}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-red-500">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Sending...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/auth/login')}
                className="w-full text-gray-500"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Login
              </Button>
            </form>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div
            key="otp"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Verify OTP</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit code sent to {email}
              </p>
            </div>

            <div className="space-y-4">
              <OTPInput
                value={otp}
                onChange={handleVerifyOTP}
                error={!!error}
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isLoading}
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

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('email')}
                className="w-full text-gray-500"
              >
                <ArrowLeft size={18} className="mr-2" />
                Change Email
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'reset' && (
          <motion.div
            key="reset"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-brand-primary" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
              <p className="text-sm text-gray-500 mt-1">
                Create a new password for your account
              </p>
            </div>

            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="password"
                    placeholder="Create a strong password"
                    className="pl-10"
                    {...resetForm.register("password")}
                  />
                </div>
                {resetForm.watch("password") && (
                  <PasswordStrengthMeter password={resetForm.watch("password")} />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="password"
                    placeholder="Re-enter your password"
                    className="pl-10"
                    {...resetForm.register("confirmPassword")}
                  />
                </div>
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check size={40} className="text-green-600" />
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Password Reset!</h2>
            <p className="text-sm text-gray-500">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
