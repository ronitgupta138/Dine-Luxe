"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { LoginForm } from "@/components/auth/LoginForm"
import { Utensils } from "lucide-react"

export default function LoginPage() {
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
            className="w-16 h-16 bg-brand-primary rounded-md flex items-center justify-center mx-auto mb-4"
          >
            <Utensils size={32} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your DineLuxe account</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
          <LoginForm />
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-brand-primary hover:underline"
          >
            Forgot your password?
          </Link>
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-brand-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
