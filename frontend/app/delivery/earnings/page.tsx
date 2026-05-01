"use client"

import Link from "next/link"
import { ArrowLeft, CalendarDays, IndianRupee, PackageCheck, TrendingUp } from "lucide-react"

const history = [
  { day: "Today", deliveries: 8, earnings: 1840, incentives: 240 },
  { day: "Yesterday", deliveries: 11, earnings: 2360, incentives: 320 },
  { day: "Apr 30", deliveries: 9, earnings: 1980, incentives: 180 },
  { day: "Apr 29", deliveries: 7, earnings: 1510, incentives: 120 },
]

export default function DeliveryEarningsPage() {
  const total = history.reduce((sum, row) => sum + row.earnings + row.incentives, 0)

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <Link href="/delivery" className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to deliveries
        </Link>

        <section className="rounded-lg bg-[#1A3C5E] p-6 text-white">
          <p className="text-sm text-white/70">Weekly payout</p>
          <h1 className="mt-2 text-3xl font-bold">Rs {total.toLocaleString("en-IN")}</h1>
          <p className="mt-2 text-sm text-white/75">Includes base pay, distance pay, and incentives.</p>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric icon={PackageCheck} label="Deliveries" value="35" />
          <Metric icon={IndianRupee} label="Incentives" value="Rs 860" />
          <Metric icon={TrendingUp} label="Rating" value="4.8" />
        </div>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-lg font-bold text-gray-950">Earnings History</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {history.map((row) => (
              <div key={row.day} className="grid gap-3 px-5 py-4 sm:grid-cols-4">
                <div className="flex items-center gap-2 font-semibold text-gray-950">
                  <CalendarDays size={16} className="text-gray-500" aria-hidden="true" />
                  {row.day}
                </div>
                <p className="text-sm text-gray-600">{row.deliveries} deliveries</p>
                <p className="text-sm text-gray-600">Base Rs {row.earnings.toLocaleString("en-IN")}</p>
                <p className="text-sm font-bold text-[#1E7E34]">+ Rs {row.incentives.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <Icon size={22} className="text-[#1A3C5E]" aria-hidden="true" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-950">{value}</p>
    </div>
  )
}
