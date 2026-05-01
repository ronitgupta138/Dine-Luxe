"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react"

interface TopBarProps {
  onMenuClick?: () => void
  className?: string
}

export function TopBar({ onMenuClick, className }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
  }

  // Mock notifications
  const notifications = [
    { id: 1, title: "New order received", message: "Table 5 placed an order", time: "2 min ago", read: false },
    { id: 2, title: "Booking confirmed", message: "Reservation for 4 at 7:00 PM", time: "15 min ago", read: false },
    { id: 3, title: "Inventory alert", message: "Tomatoes running low", time: "1 hour ago", read: true },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className={cn(
      "h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6",
      className
    )}>
      {/* Left side */}
      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </motion.button>

        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2 w-64">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <button className="text-xs text-brand-primary hover:underline">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      whileHover={{ backgroundColor: "#F9FAFB" }}
                      className={cn(
                        "px-4 py-3 border-b border-gray-50 cursor-pointer",
                        !notification.read && "bg-blue-50/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                          notification.read ? "bg-gray-300" : "bg-brand-primary"
                        )} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
              <User size={16} className="text-brand-primary" />
            </div>
            <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
          </motion.button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {(user as any)?.user_metadata?.first_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {(user as any)?.user_metadata?.role?.replace("_", " ")}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push("/owner/settings")
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
