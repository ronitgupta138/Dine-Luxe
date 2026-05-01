"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import {
  LayoutDashboard,
  Utensils,
  Users,
  Calendar,
  Settings,
  BarChart3,
  Store,
  ChefHat,
  ClipboardList,
  CreditCard,
  QrCode,
  MessageSquare,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

const navItems: NavItem[] = [
  // Super Admin
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} />, roles: ["super_admin"] },
  { label: "Restaurants", href: "/admin/restaurants", icon: <Store size={20} />, roles: ["super_admin"] },
  { label: "Customers", href: "/admin/customers", icon: <Users size={20} />, roles: ["super_admin"] },
  { label: "Reports", href: "/admin/reports", icon: <BarChart3 size={20} />, roles: ["super_admin"] },
  { label: "Platform Health", href: "/admin/platform-health", icon: <Shield size={20} />, roles: ["super_admin"] },
  { label: "Settings", href: "/admin/settings", icon: <Settings size={20} />, roles: ["super_admin"] },

  // Owner
  { label: "Dashboard", href: "/owner/dashboard", icon: <LayoutDashboard size={20} />, roles: ["owner"] },
  { label: "Branches", href: "/owner/branches", icon: <Store size={20} />, roles: ["owner"] },
  { label: "Menu", href: "/owner/menu", icon: <Utensils size={20} />, roles: ["owner"] },
  { label: "Staff", href: "/owner/staff", icon: <Users size={20} />, roles: ["owner"] },
  { label: "Bookings", href: "/owner/bookings", icon: <Calendar size={20} />, roles: ["owner"] },
  { label: "Customers", href: "/owner/customers", icon: <Users size={20} />, roles: ["owner"] },
  { label: "Reports", href: "/owner/reports", icon: <BarChart3 size={20} />, roles: ["owner"] },
  { label: "Branding", href: "/owner/branding", icon: <Settings size={20} />, roles: ["owner"] },
  { label: "Settings", href: "/owner/settings", icon: <Settings size={20} />, roles: ["owner"] },

  // Staff (Manager, Host, Waiter, Chef, Cashier)
  { label: "Dashboard", href: "/staff/dashboard", icon: <LayoutDashboard size={20} />, roles: ["manager", "host", "waiter", "chef", "cashier"] },
  { label: "Floor Map", href: "/staff/host", icon: <QrCode size={20} />, roles: ["manager", "host"] },
  { label: "Queue", href: "/staff/host", icon: <ClipboardList size={20} />, roles: ["manager", "host"] },
  { label: "Orders", href: "/staff/waiter", icon: <Utensils size={20} />, roles: ["manager", "waiter"] },
  { label: "Kitchen", href: "/staff/chef", icon: <ChefHat size={20} />, roles: ["manager", "chef"] },
  { label: "POS", href: "/staff/cashier", icon: <CreditCard size={20} />, roles: ["manager", "cashier"] },
  { label: "Reports", href: "/staff/manager", icon: <BarChart3 size={20} />, roles: ["manager"] },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const role = (user as any)?.user_metadata?.role as string


  const filteredNavItems = navItems.filter((item) => item.roles.includes(role))

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
  }

  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-100 z-40 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-gray-100",
        collapsed ? "justify-center px-2" : "px-4"
      )}>
        {collapsed ? (
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-semibold text-gray-900">DineLuxe</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <motion.button
              key={item.href}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-primary text-white"
                  : "text-gray-600 hover:bg-gray-50",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </motion.button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn(
        "border-t border-gray-100 py-3 px-2",
        collapsed && "flex flex-col items-center"
      )}>
        {/* User info */}
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {(user as any)?.user_metadata?.first_name || user?.email}
            </p>

            <p className="text-xs text-gray-500 capitalize">{role?.replace("_", " ")}</p>
          </div>
        )}

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </motion.button>

        {/* Collapse toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors mt-1",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span>Collapse</span>}
        </motion.button>
      </div>
    </motion.aside>
  )
}
