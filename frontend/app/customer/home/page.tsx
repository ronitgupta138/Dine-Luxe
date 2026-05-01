"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { FoodCard } from "@/components/customer/FoodCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import {
  Search,
  QrCode,
  Calendar,
  ShoppingBag,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  Flame,
  TrendingUp,
} from "lucide-react"

const featuredItems = [
  {
    id: "1",
    name: "Butter Chicken",
    description: "Creamy tomato-based curry with tender chicken pieces",
    price: 449,
    discountedPrice: 349,
    photoUrl: "/food/butter-chicken.jpg",
    dietaryTags: ["non-veg"],
    allergens: ["dairy"],
    isAvailable: true,
    isSoldOut: false,
    prepTimeMinutes: 25,
  },
  {
    id: "2",
    name: "Paneer Tikka",
    description: "Grilled cottage cheese with spices and herbs",
    price: 349,
    discountedPrice: 299,
    photoUrl: "/food/paneer-tikka.jpg",
    dietaryTags: ["veg"],
    allergens: ["dairy"],
    isAvailable: true,
    isSoldOut: false,
    prepTimeMinutes: 20,
  },
  {
    id: "3",
    name: "Dal Makhani",
    description: "Creamy black lentils slow-cooked overnight",
    price: 299,
    discountedPrice: 249,
    photoUrl: "/food/dal-makhani.jpg",
    dietaryTags: ["veg"],
    allergens: ["dairy"],
    isAvailable: true,
    isSoldOut: false,
    prepTimeMinutes: 15,
  },
]

const activeOrders = [
  {
    id: "ORD-001",
    status: "preparing" as const,
    items: ["Butter Chicken", "Naan (2)"],
    total: 498,
    estimatedTime: "15 min",
  },
]

const quickActions = [
  { label: "Scan QR", icon: <QrCode size={24} />, href: "/customer/scan", color: "bg-blue-500" },
  { label: "Book Table", icon: <Calendar size={24} />, href: "/customer/booking", color: "bg-green-500" },
  { label: "My Orders", icon: <ShoppingBag size={24} />, href: "/customer/order", color: "bg-purple-500" },
  { label: "Menu", icon: <TrendingUp size={24} />, href: "/customer/menu", color: "bg-orange-500" },
]

export default function CustomerHomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Welcome back</p>
          <h1 className="text-xl font-bold text-gray-900">John Doe</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={16} />
          <span>Mumbai</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search dishes, restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(action.href)}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              {action.icon}
            </div>
            <span className="text-xs font-medium text-gray-700">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Active Order</h2>
            <StatusBadge status={activeOrders[0].status} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{activeOrders[0].items.join(", ")}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock size={14} />
                <span>Ready in {activeOrders[0].estimatedTime}</span>
              </div>
              <span className="font-semibold text-gray-900">₹{activeOrders[0].total}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Featured Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-orange-500" />
            <h2 className="font-semibold text-gray-900">Popular Dishes</h2>
          </div>
          <button
            onClick={() => router.push("/customer/menu")}
            className="text-sm text-brand-primary flex items-center gap-1"
          >
            See All
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-4">
          {featuredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FoodCard item={item} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Loyalty Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl p-5 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Loyalty Points</p>
            <p className="text-2xl font-bold">2,450</p>
            <p className="text-xs opacity-70 mt-1">550 points until next reward</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Star size={28} className="text-yellow-300" />
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-yellow-300 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "82%" }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </motion.div>
    </PageWrapper>
  )
}
