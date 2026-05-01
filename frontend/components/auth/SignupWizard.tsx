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
import { PasswordStrengthMeter } from "./PasswordStrengthMeter"
import { Loader2, User, Mail, Phone, MapPin, Lock, ChevronRight, ChevronLeft, Check } from "lucide-react"

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(6, "Postal code must be at least 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type SignupForm = z.infer<typeof signupSchema>

interface Field {
  name: keyof SignupForm
  label: string
  placeholder: string
  type?: string
  icon: React.ReactNode
}

interface Step {
  title: string
  description: string
  fields: Field[]
}

const steps: Step[] = [
  {
    title: "Your Profile",
    description: "Let's start with your basic information",
    fields: [
      { name: "firstName", label: "First Name", placeholder: "John", icon: <User size={18} /> },
      { name: "lastName", label: "Last Name", placeholder: "Doe", icon: <User size={18} /> },
      { name: "email", label: "Email", placeholder: "john@example.com", type: "email", icon: <Mail size={18} /> },
    ],
  },
  {
    title: "Contact Details",
    description: "How can we reach you?",
    fields: [
      { name: "phone", label: "Phone Number", placeholder: "+91 98765 43210", type: "tel", icon: <Phone size={18} /> },
      { name: "city", label: "City", placeholder: "Mumbai", icon: <MapPin size={18} /> },
      { name: "postalCode", label: "Postal Code", placeholder: "400001", icon: <MapPin size={18} /> },
    ],
  },
  {
    title: "Security Setup",
    description: "Create a strong password to protect your account",
    fields: [
      { name: "password", label: "Password", placeholder: "Create a strong password", type: "password", icon: <Lock size={18} /> },
      { name: "confirmPassword", label: "Confirm Password", placeholder: "Re-enter your password", type: "password", icon: <Lock size={18} /> },
    ],
  },
]

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
}

export function SignupWizard() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, trigger, formState: { errors }, watch, setError: setFormError } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  })

  const password = watch("password")
  const confirmPassword = watch("confirmPassword")

  const currentStep = steps[step]
  const isLastStep = step === steps.length - 1

  const handleNext = async () => {
    const fieldsToValidate = currentStep.fields.map((f) => f.name) as Array<keyof SignupForm>
    const isValid = await trigger(fieldsToValidate)

    if (isValid) {
      setDirection(1)
      setStep((prev) => prev + 1)
      setError(null)
    }
  }

  const handleBack = () => {
    setDirection(-1)
    setStep((prev) => prev - 1)
    setError(null)
  }

  const onSubmit = async (data: SignupForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = await getBrowserSupabase()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            city: data.city,
            postal_code: data.postalCode,
            role: "customer",
          },
        },
      })

      if (authError) throw authError

      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/verify-otp")
      }, 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Check size={32} className="text-green-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Created!</h3>
        <p className="text-sm text-gray-500">Redirecting to verification...</p>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((s, index) => (
            <div key={s.title} className="flex items-center">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= step
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
                animate={{
                  scale: index === step ? 1.1 : 1,
                  backgroundColor: index <= step ? "#1A3C5E" : "#F3F4F6",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {index < step ? <Check size={16} /> : index + 1}
              </motion.div>
              {index < steps.length - 1 && (
                <div className="w-12 h-0.5 mx-2 bg-gray-100 overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: index < step ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Step {step + 1} of {steps.length}</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-1">{currentStep.title}</h2>
          <p className="text-sm text-gray-500">{currentStep.description}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-4"
          >
            {currentStep.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{field.label}</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {field.icon}
                  </div>
                  <Input
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    className="pl-10"
                    disabled={isSubmitting}
                    {...register(field.name)}
                  />
                </div>
                {errors[field.name] && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500"
                  >
                    {errors[field.name]?.message}
                  </motion.p>
                )}
              </div>
            ))}

            {/* Password strength meter */}
            {step === 2 && password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <PasswordStrengthMeter password={password} />
              </motion.div>
            )}

            {/* Password match indicator */}
            {step === 2 && confirmPassword && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs ${
                  password === confirmPassword ? "text-green-600" : "text-red-500"
                }`}
              >
                {password === confirmPassword ? " Passwords match" : " Passwords do not match"}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0 || isSubmitting}
            className="text-gray-500"
          >
            <ChevronLeft size={18} className="mr-1" />
            Back
          </Button>

          {isLastStep ? (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <Check size={18} className="ml-1" />
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              Next
              <ChevronRight size={18} className="ml-1" />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
