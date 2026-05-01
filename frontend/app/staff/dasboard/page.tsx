"use client"

import { motion } from "framer-motion"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { KPICard } from "@/components/charts/KPICard"
import { OrderTicket } from "@/components/orders/OrderTicket"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { TableUnit } from "@/components/floor/TableUnit"
import {
  Utensils,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

const kpiData = [
  {
    title: "Active Orders",
    value: 12,
    change: 15,
    changeType: "increase" as const,
    icon: <Utensils size={20} />,
    color: "blue",
  },
  {
    title: "Avg Prep Time",
    value: 18,
    suffix: "min",
    change: -5,
    changeType: "decrease" as const,
    icon: <Clock size={20} />,
    color: "green",
  },
  {
    title: "Customers",
    value: 45,
    change: 8,
    changeType: "increase" as const,
    icon: <Users size={20} />,
    color: "purple",
  },
  {
    title: "Revenue",
    value: 12500,
    prefix: "₹",
    change: 12,
    changeType: "increase" as const,
    icon: <DollarSign size={20} />,
    color: "orange",
  },
]

const activeOrders = [
  {
    id: "ORD-001",
    tableLabel: "T5",
    items: [
      { name: "Butter Chicken", quantity: 1, notes: "Extra spicy" },
      { name: "Garlic Naan", quantity: 2 },
    ],
    status: "preparing" as const,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: "ORD-002",
    tableLabel: "T3",
    items: [
      { name: "Paneer Tikka", quantity: 1 },
      { name: "Dal Makhani", quantity: 1 },
    ],
    status: "pending" as const,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "ORD-003",
    tableLabel: "T8",
    items: [
      { name: "Biryani", quantity: 2, notes: "No onions" },
    ],
    status: "ready" as const,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
]


const tables = [
  { id: "T1", label: "T1", status: "occupied" as const, capacity: 4, shape: "round" as const, zone: "Main" },
  { id: "T2", label: "T2", status: "free" as const, capacity: 2, shape: "square" as const, zone: "Window" },
  { id: "T3", label: "T3", status: "occupied" as const, capacity: 6, shape: "rectangle" as const, zone: "Main" },
  { id: "T4", label: "T4", status: "reserved" as const, capacity: 4, shape: "round" as const, zone: "Patio" },
  { id: "T5", label: "T5", status: "occupied" as const, capacity: 2, shape: "square" as const, zone: "Window" },
  { id: "T6", label: "T6", status: "cleaning" as const, capacity: 4, shape: "round" as const, zone: "Main" },
]


export default function StaffDashboardPage() {
  return (
    <PageWrapper title="Staff Dashboard" subtitle="Overview of today's operations">
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

      {/* Active Orders */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Orders</h2>
        <div className="grid gap-4">
          {activeOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <OrderTicket order={order} />

            </motion.div>
          ))}
        </div>
      </div>

      {/* Floor Status */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Floor Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {tables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <TableUnit table={table} />

            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
