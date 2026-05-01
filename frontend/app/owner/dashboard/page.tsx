"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { KPICard } from "@/components/charts/KPICard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import {
  DollarSign,
  Users,
  ShoppingBag,
  Star,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
} from "lucide-react"

const kpiData = [
  {
    title: "Today's Revenue",
    value: 45230,
    prefix: "Rs ",
    change: 12,
    changeType: "increase" as const,
    icon: <DollarSign size={20} />,
    color: "blue",
  },
  {
    title: "Total Orders",
    value: 156,
    change: 8,
    changeType: "increase" as const,
    icon: <ShoppingBag size={20} />,
    color: "green",
  },
  {
    title: "Customers",
    value: 89,
    change: -3,
    changeType: "decrease" as const,
    icon: <Users size={20} />,
    color: "purple",
  },
  {
    title: "Avg Rating",
    value: 4.8,
    suffix: "/5",
    change: 5,
    changeType: "increase" as const,
    icon: <Star size={20} />,
    color: "orange",
  },
]

const recentOrders = [
  { id: "ORD-001", customer: "John Doe", items: 3, total: 1250, status: "preparing" as const, time: "5 min ago" },
  { id: "ORD-002", customer: "Jane Smith", items: 2, total: 890, status: "ready" as const, time: "12 min ago" },
  { id: "ORD-003", customer: "Mike Johnson", items: 5, total: 2100, status: "served" as const, time: "25 min ago" },
  { id: "ORD-004", customer: "Sarah Williams", items: 1, total: 450, status: "pending" as const, time: "2 min ago" },
]

const topItems = [
  { name: "Butter Chicken", orders: 45, revenue: 15705 },
  { name: "Paneer Tikka", orders: 38, revenue: 11362 },
  { name: "Biryani", orders: 32, revenue: 11168 },
  { name: "Dal Makhani", orders: 28, revenue: 6972 },
]

const staffPerformance = [
  { name: "Chef Rahul", role: "Chef", orders: 45, rating: 4.9 },
  { name: "Waiter Priya", role: "Waiter", orders: 32, rating: 4.7 },
  { name: "Host Amit", role: "Host", orders: 28, rating: 4.8 },
]

export default function OwnerDashboardPage() {
  const router = useRouter()

  return (
    <PageWrapper title="Dashboard" subtitle="Overview of your restaurant performance">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <KPICard {...kpi} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-md border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <button onClick={() => router.push("/owner/bookings")} className="text-sm text-brand-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{order.customer}</p>
                  <p className="text-xs text-gray-500">{order.items} items - {order.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">Rs {order.total}</span>
                  <StatusBadge status={order.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-md border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Selling Items</h2>
            <button onClick={() => router.push("/owner/menu")} className="text-sm text-brand-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.orders} orders</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">Rs {item.revenue}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Staff Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-md border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Staff Performance</h2>
          <button onClick={() => router.push("/owner/staff")} className="text-sm text-brand-primary hover:underline">View All</button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {staffPerformance.map((staff) => (
            <div
              key={staff.name}
              className="p-4 bg-gray-50 rounded-xl text-center"
            >
              <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users size={20} className="text-brand-primary" />
              </div>
              <p className="font-medium text-gray-900 text-sm">{staff.name}</p>
              <p className="text-xs text-gray-500 capitalize">{staff.role}</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">{staff.orders}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{staff.rating}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  )
}
