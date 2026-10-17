"use client"

import { motion } from "framer-motion"
import Link from "next/link"
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
  return (
    <PageWrapper title="Dashboard" subtitle="Overview of your restaurant performance">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-950">Recent Orders</h2>
            <Link href="/owner/bookings" className="text-sm font-semibold text-brand-primary hover:underline">View All &rarr;</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100"
              >
                <div>
                  <p className="font-semibold text-gray-950 text-sm">{order.customer}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.items} items &bull; {order.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-950">Rs {order.total.toLocaleString('en-IN')}</span>
                  <StatusBadge status={order.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-950">Top Selling Items</h2>
            <Link href="/owner/menu" className="text-sm font-semibold text-brand-primary hover:underline">View All &rarr;</Link>
          </div>
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.orders} orders</p>
                  </div>
                </div>
                <span className="font-bold text-gray-950">Rs {item.revenue.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-950">Staff Performance</h2>
          <Link href="/owner/staff" className="text-sm font-semibold text-brand-primary hover:underline">View All &rarr;</Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {staffPerformance.map((staff) => (
            <div
              key={staff.name}
              className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 text-center"
            >
              <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users size={20} className="text-brand-primary" />
              </div>
              <p className="font-semibold text-gray-950 text-sm mt-1">{staff.name}</p>
              <p className="text-xs text-gray-500 capitalize">{staff.role}</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <div>
                  <p className="text-lg font-bold text-gray-950">{staff.orders}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-950">{staff.rating}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
