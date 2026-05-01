"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getBrowserSupabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = await getBrowserSupabase()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        throw authError
      }

      if (authData.session) {
        const role = authData.session.user.user_metadata?.role as string
        switch (role) {
          case 'super_admin': router.push('/admin/dashboard'); break
          case 'owner': router.push('/owner/dashboard'); break
          case 'manager':
          case 'host':
          case 'waiter':
          case 'chef':
          case 'cashier': router.push('/staff/dashboard'); break
          case 'customer': router.push('/customer/home'); break
          default: router.push('/auth/onboarding')
        }
      }
    } catch (err) {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      setError(err instanceof Error ? err.message : "Invalid credentials")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className={shake ? "animate-shake" : ""}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500"
            >
              {errors.email.message}
            </motion.p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500"
            >
              {errors.password.message}
            </motion.p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </div>
    </motion.form>
  )
}
