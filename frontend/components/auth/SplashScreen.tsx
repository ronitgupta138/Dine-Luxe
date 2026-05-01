"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { getBrowserSupabase } from "@/lib/supabase-client"

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url?.startsWith("https://") && key && key !== "anon-key" && key.length > 40)
}

// Simple food-themed SVG animation as fallback (since we may not have Lottie files yet)
const FoodAnimation = () => (
  <motion.svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Plate */}
    <motion.circle
      cx="100"
      cy="100"
      r="80"
      stroke="#E8A020"
      strokeWidth="4"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    <motion.circle
      cx="100"
      cy="100"
      r="60"
      stroke="#1A3C5E"
      strokeWidth="2"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
    />
    {/* Steam lines */}
    <motion.path
      d="M80 60 Q80 40 90 30"
      stroke="#1A3C5E"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 1, delay: 0.8, repeat: Infinity, repeatType: "reverse" }}
    />
    <motion.path
      d="M100 55 Q100 35 110 25"
      stroke="#1A3C5E"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 1, delay: 1, repeat: Infinity, repeatType: "reverse" }}
    />
    <motion.path
      d="M120 60 Q120 40 130 30"
      stroke="#1A3C5E"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 1, delay: 1.2, repeat: Infinity, repeatType: "reverse" }}
    />
    {/* Food items */}
    <motion.circle
      cx="85"
      cy="95"
      r="15"
      fill="#E8A020"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
    />
    <motion.circle
      cx="115"
      cy="95"
      r="15"
      fill="#1A3C5E"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.7 }}
    />
    <motion.circle
      cx="100"
      cy="115"
      r="15"
      fill="#E8A020"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.9 }}
    />
  </motion.svg>
)

export function SplashScreen() {
  const router = useRouter()
  const [showSkip, setShowSkip] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const [branding, setBranding] = useState<{ logo?: string; name?: string } | null>(null)

  const navigateToNext = useCallback(async () => {
    try {
      if (!isSupabaseConfigured()) {
        router.replace('/auth/login')
        return
      }

      const supabase = await getBrowserSupabase()

      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        const role = session.user.user_metadata?.role as string
        switch (role) {
          case 'super_admin': router.replace('/admin/dashboard'); break
          case 'owner': router.replace('/owner/dashboard'); break
          case 'manager': router.replace('/staff/manager/dashboard'); break
          case 'host': router.replace('/staff/host'); break
          case 'waiter': router.replace('/staff/waiter'); break
          case 'chef': router.replace('/staff/chef/kitchen'); break
          case 'cashier': router.replace('/staff/cashier'); break
          case 'customer': router.replace('/customer/home'); break
          case 'delivery_partner': router.replace('/delivery'); break
          default: router.replace('/auth/login')
        }
      } else {
        router.replace('/auth/login')
      }
    } catch {
      router.replace('/auth/login')
    }
  }, [router])

  useEffect(() => {
    // Load branding from localStorage (white-label support)
    try {
      const stored = localStorage.getItem('restaurant_branding')
      if (stored) {
        setBranding(JSON.parse(stored))
      }
    } catch {
      // ignore
    }

    // Show logo after 0.8s
    const logoTimer = setTimeout(() => setShowLogo(true), 800)

    // Show skip button after 1s
    const skipTimer = setTimeout(() => setShowSkip(true), 1000)

    // Auto-navigate after 2.5s
    const navTimer = setTimeout(() => {
      navigateToNext()
    }, 2500)

    return () => {
      clearTimeout(logoTimer)
      clearTimeout(skipTimer)
      clearTimeout(navTimer)
    }
  }, [navigateToNext])

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Lottie Animation / SVG Fallback */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <FoodAnimation />
      </motion.div>

      {/* Logo and App Name */}
      <AnimatePresence>
        {showLogo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-8 text-center"
          >
            {branding?.logo ? (
              <img
                src={branding.logo}
                alt={branding.name || 'Restaurant'}
                className="h-16 mx-auto mb-3 object-contain"
              />
            ) : (
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">D</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">DineLuxe</span>
              </div>
            )}
            <p className="text-sm text-gray-500">
              {branding?.name || 'Restaurant OS'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Button */}
      <AnimatePresence>
        {showSkip && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            onClick={navigateToNext}
          >
            Skip
          </motion.button>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      <motion.div
        className="absolute bottom-16 w-32 h-1 bg-gray-100 rounded-full overflow-hidden"
      >
        <motion.div
          className="h-full bg-brand-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "linear" }}
        />
      </motion.div>
    </div>
  )
}
