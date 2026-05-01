"use client"

import { motion } from "framer-motion"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { KPICard } from "@/components/charts/KPICard"
import { RoleBadge } from "@/components/shared/RoleBadge"
import {
  Store,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
} from "lucide-react"

const kpiData = [
  {
    title: "Total Restaurants",
    value: 156,
    change: 12,
    changeType: "increase" as const,
    icon: <Store size={20} />,
    color: "blue",
  },
  {
    title: "Total Users",
    value: 12543,
    change: 18,
    changeType: "increase" as const,
    icon: <Users size={20} />,
    color: "green",
  },
  {
    title: "Platform Revenue",
    value: 2450000,
    prefix: "₹",
    change: 15,
    changeType: "increase" as const,
    icon: <DollarSign size={20} />,
    color: "purple",
  },
  {
    title: "Active Orders",
    value: 342,
    change: -5,
    changeType: "decrease" as const,
    icon: <Activity size={20} />,
    color: "orange",
  },
]

const recentRestaurants = [
  { id: "1", name: "Spice Garden", owner: "Rajesh Kumar", status: "active", revenue: 125000, rating: 4.8 },
  { id: "2", name: "Tandoori Nights", owner: "Priya Sharma", status: "active", revenue: 98000, rating: 4.6 },
  { id: "3", name: "Biryani House", owner: "Amit Singh", status: "pending", revenue: 0, rating: 0 },
  { id: "4", name: "Curry Leaf", owner: "Sneha Patel", status: "active", revenue: 156000, rating: 4.9 },
]

const recentUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "customer" as const, joined: "2 days ago" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "owner" as const, joined: "5 days ago" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", role: "manager" as const, joined: "1 week ago" },
  { id: "4", name: "Sarah Williams", email: "sarah@example.com", role: "customer" as const, joined: "2 weeks ago" },
]

const systemHealth = [
  { name: "API Response Time", value: 45, unit: "ms", status: "good" as const },
  { name: "Database CPU", value: 32, unit: "%", status: "good" as const },
  { name: "Memory Usage", value: 68, unit: "%", status: "warning" as const },
  { name: "Error Rate", value: 0.5, unit: "%", status: "good" as const },
]

export default function AdminDashboardPage() {
  return (
    <PageWrapper title="Admin Dashboard" subtitle="Platform overview and management">
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
        {/* Recent Restaurants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Restaurants</h2>
            <button className="text-sm text-brand-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{restaurant.name}</p>
                  <p className="text-xs text-gray-500">{restaurant.owner}</p>
                </div>
                <div className="flex items-center gap-3">
                  {restaurant.revenue > 0 && (
                    <span className="text-sm text-gray-900">₹{restaurant.revenue.toLocaleString()}</span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {restaurant.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <button className="text-sm text-brand-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={user.role} size="sm" />
                  <span className="text-xs text-gray-400">{user.joined}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <Shield size={16} />
            <span>All Systems Operational</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemHealth.map((metric) => (
            <div
              key={metric.name}
              className="p-4 bg-gray-50 rounded-xl"
            >
              <p className="text-sm text-gray-500 mb-2">{metric.name}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {metric.value}
                  <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit}</span>
                </span>
                {metric.status === "warning" ? (
                  <AlertTriangle size={20} className="text-yellow-500" />
                ) : (
                  <Shield size={20} className="text-green-500" />
                )}
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    metric.status === "warning" ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(metric.value, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  )
}
