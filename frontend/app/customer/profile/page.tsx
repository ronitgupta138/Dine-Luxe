"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Button } from "@/components/ui/button"
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Star, Settings, LogOut, Edit, Shield,
  CreditCard, Bell
} from "lucide-react"

const menuItems = [
  { icon: CreditCard, label: "Payment Methods", value: "2 saved", href: "/customer/payment" },
  { icon: Bell, label: "Notifications", value: "", href: "/customer/notifications" },
  { icon: Shield, label: "Privacy & Security", value: "", href: "/customer/security" },
  { icon: Settings, label: "Settings", value: "", href: "/customer/settings" },
]

export default function CustomerProfilePage() {
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 98765 43210",
    joined: "January 2024",
    LoyaltyPoints: 1250,
    totalOrders: 45,
    favoriteRestaurant: "Spice Garden",
  })

  return (
    <PageWrapper title="Profile" subtitle="Your account information">
      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 text-center"
        >
          {/* Avatar */}
          <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={40} className="text-brand-primary" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <Edit size={14} className="mr-2" />
            Edit Profile
          </Button>
        </motion.div>

{/* Loyalty Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-linear-to-br from-brand-primary to-brand-primary/80 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star size={20} className="text-yellow-300" />
              <span className="font-semibold">Loyalty Points</span>
            </div>
            <span className="text-3xl font-bold">{user.LoyaltyPoints}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{user.totalOrders}</p>
              <p className="text-sm text-white/70">Orders</p>
            </div>
            <div>
              <p className="text-2xl font-bold">₹12,500</p>
              <p className="text-sm text-white/70">Spent</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{user.favoriteRestaurant}</p>
              <p className="text-sm text-white/70">Favorite</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
        >
          <h3 className="font-semibold text-gray-900">Contact Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-gray-400" />
              <span className="text-gray-600">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={18} className="text-gray-400" />
              <span className="text-gray-600">{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-gray-600">Joined {user.joined}</span>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-gray-400" />
                <span className="text-gray-900">{item.label}</span>
              </div>
              {item.value && (
                <span className="text-sm text-gray-500">{item.value}</span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
