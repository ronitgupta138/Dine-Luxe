"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Activity, CalendarDays, DollarSign, RefreshCw, Store, Users } from "lucide-react"
import PageWrapper from "@/components/layout/PageWrapper"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const restaurants = ["All restaurants", "Spice Garden", "Curry Leaf", "Biryani House", "Tandoori Nights"]
const ranges = ["Last 7 days", "Last 30 days", "Last 90 days", "Custom"]

const orderTrend = Array.from({ length: 30 }, (_, index) => ({
  day: `${index + 1}`,
  orders: 110 + Math.round(Math.sin(index / 3) * 28) + index * 3,
  revenue: 62000 + Math.round(Math.cos(index / 4) * 9000) + index * 1200,
}))

const topRestaurants = [
  { name: "Curry Leaf", revenue: 480000 },
  { name: "Spice Garden", revenue: 430000 },
  { name: "Tandoori Nights", revenue: 390000 },
  { name: "Biryani House", revenue: 325000 },
  { name: "Urban Thali", revenue: 286000 },
  { name: "Masala Room", revenue: 244000 },
]

const orderTypes = [
  { name: "Dine-in", value: 46, color: "#1A3C5E" },
  { name: "Delivery", value: 34, color: "#1E7E34" },
  { name: "Takeaway", value: 20, color: "#E8A020" },
]

const liveOrders = [
  { id: "ORD-1208", restaurant: "Curry Leaf", total: 2850, type: "Dine-in", status: "preparing", time: "1 min ago" },
  { id: "ORD-1207", restaurant: "Spice Garden", total: 1420, type: "Delivery", status: "ready", time: "3 min ago" },
  { id: "ORD-1206", restaurant: "Tandoori Nights", total: 980, type: "Takeaway", status: "paid", time: "6 min ago" },
  { id: "ORD-1205", restaurant: "Biryani House", total: 3180, type: "Dine-in", status: "pending", time: "8 min ago" },
  { id: "ORD-1204", restaurant: "Urban Thali", total: 760, type: "Delivery", status: "served", time: "11 min ago" },
]

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const duration = 800
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN")}
    </span>
  )
}

function KpiTile({
  label,
  value,
  icon: Icon,
  prefix,
  tone,
}: {
  label: string
  value: number
  icon: React.ElementType
  prefix?: string
  tone: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-rise">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-gray-950">
            <AnimatedNumber value={value} prefix={prefix} />
          </p>
        </div>
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-lg text-white", tone)}>
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

function HeatMap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const hours = Array.from({ length: 24 }, (_, hour) => hour)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[48px_repeat(24,minmax(22px,1fr))] gap-1 text-[10px] text-gray-500">
          <span />
          {hours.map((hour) => (
            <span key={hour} className="text-center">{hour}</span>
          ))}
          {days.map((day, dayIndex) => (
            <div key={day} className="contents">
              <span className="flex items-center font-medium">{day}</span>
              {hours.map((hour) => {
                const count = Math.max(2, Math.round(20 + Math.sin((hour + dayIndex) / 3) * 18 + (hour > 18 ? 34 : 0) + (dayIndex > 4 ? 24 : 0)))
                const opacity = Math.min(0.18 + count / 95, 0.95)
                return (
                  <div
                    key={`${day}-${hour}`}
                    title={`${day} ${hour}:00 - ${count} orders`}
                    className="h-7 rounded-sm border border-white"
                    style={{ backgroundColor: `rgba(26, 60, 94, ${opacity})` }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [range, setRange] = useState(ranges[1])
  const [restaurant, setRestaurant] = useState(restaurants[0])

  const kpis = useMemo(() => [
    { label: "Total Active Restaurants", value: 156, icon: Store, tone: "bg-[#1A3C5E]" },
    { label: "Total Customers", value: 12543, icon: Users, tone: "bg-[#2980B9]" },
    { label: "Orders Today", value: 342, icon: Activity, tone: "bg-[#1E7E34]" },
    { label: "Revenue Today", value: 2450000, icon: DollarSign, prefix: "Rs ", tone: "bg-[#E8A020]" },
  ], [])

  return (
    <PageWrapper
      title="Platform Analytics"
      subtitle="Live restaurant performance, demand patterns, and order movement"
      action={
        <button
          onClick={() => toast.success("Dashboard refreshed")}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <RefreshCw size={16} aria-hidden="true" />
          Refresh
        </button>
      }
    >
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex min-h-12 items-center gap-2 rounded-lg bg-gray-50 px-3">
          <CalendarDays size={16} className="text-gray-500" aria-hidden="true" />
          <select value={range} onChange={(event) => setRange(event.target.value)} className="bg-transparent text-sm font-medium text-gray-800 outline-none">
            {ranges.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <select value={restaurant} onChange={(event) => setRestaurant(event.target.value)} className="min-h-12 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none">
          {restaurants.map((option) => <option key={option}>{option}</option>)}
        </select>
        <span className="text-xs text-gray-500">Filters apply across every chart. Auto-refetch cadence: 5 minutes.</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => <KpiTile key={kpi.label} {...kpi} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-950">Daily Orders</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orderTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="orders" stroke="#1A3C5E" fill="#1A3C5E" fillOpacity={0.16} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-950">Top Restaurants By Revenue</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRestaurants} layout="vertical" margin={{ left: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => `Rs ${value.toLocaleString("en-IN")}`} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="#E8A020" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-950">Peak Ordering Times</h2>
          <p className="mt-1 text-sm text-gray-500">Hover cells to inspect exact order count.</p>
          <div className="mt-4">
            <HeatMap />
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-950">Order Type Split</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderTypes} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={4}>
                  {orderTypes.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2">
            {orderTypes.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-950">Live Order Feed</h2>
          <span className="text-xs font-medium text-gray-500">Last 20 orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                {["Order", "Restaurant", "Total", "Type", "Status", "Time"].map((heading) => (
                  <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {liveOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-gray-50">
                  <td className="px-5 py-4 font-semibold text-gray-950">{order.id}</td>
                  <td className="px-5 py-4 text-gray-700">{order.restaurant}</td>
                  <td className="px-5 py-4 text-gray-700">Rs {order.total.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-4 text-gray-700">{order.type}</td>
                  <td className="px-5 py-4"><StatusBadge status={order.status} size="sm" /></td>
                  <td className="px-5 py-4 text-gray-500">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageWrapper>
  )
}
