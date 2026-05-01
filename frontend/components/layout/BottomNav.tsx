"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import {
  Home,
  Search,
  ShoppingCart,
  Calendar,
  User,
  Utensils,
  QrCode,
  Heart,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
}

const customerNavItems: NavItem[] = [
  {
    label: "Home",
    href: "/customer/home",
    icon: <Home size={24} strokeWidth={1.5} />,
    activeIcon: <Home size={24} strokeWidth={2.5} />,
  },
  {
    label: "Explore",
    href: "/customer/restaurant",
    icon: <Search size={24} strokeWidth={1.5} />,
    activeIcon: <Search size={24} strokeWidth={2.5} />,
  },
  {
    label: "Scan",
    href: "/customer/scan",
    icon: <QrCode size={24} strokeWidth={1.5} />,
    activeIcon: <QrCode size={24} strokeWidth={2.5} />,
  },
  {
    label: "Orders",
    href: "/customer/order",
    icon: <ShoppingCart size={24} strokeWidth={1.5} />,
    activeIcon: <ShoppingCart size={24} strokeWidth={2.5} />,
  },
  {
    label: "Profile",
    href: "/customer/profile",
    icon: <User size={24} strokeWidth={1.5} />,
    activeIcon: <User size={24} strokeWidth={2.5} />,
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [cartCount] = useState(2) // Mock cart count

  const role = (user as any)?.user_metadata?.role as string

  // Only show for customers
  if (role !== "customer") return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {customerNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <motion.button
              key={item.href}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors relative",
                isActive ? "text-brand-primary" : "text-gray-400"
              )}
            >
              <div className="relative">
                {isActive ? item.activeIcon : item.icon}
                {item.label === "Orders" && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-brand-primary" : "text-gray-400"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-2 w-8 h-0.5 bg-brand-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
      {/* Safe area padding for mobile */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
