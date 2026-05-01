"use client"

import Link from "next/link"
import { Bike, CheckCircle2, Clock, IndianRupee, MapPin, Navigation, PackageCheck, Phone, Star } from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { toast } from "sonner"

const tasks = [
  { id: "DL-2041", restaurant: "Curry Leaf", customer: "Aarav Mehta", distance: "2.4 km", eta: "12 min", status: "picked_up" },
  { id: "DL-2042", restaurant: "Spice Garden", customer: "Nisha Rao", distance: "3.1 km", eta: "18 min", status: "assigned" },
]

export default function DeliveryPartnerPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-[#1A3C5E] px-4 pb-20 pt-8 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/70">Delivery Partner</p>
              <h1 className="mt-1 text-2xl font-bold">Live Delivery Console</h1>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/12">
              <Bike size={24} aria-hidden="true" />
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-12 max-w-5xl space-y-5 px-4 pb-10">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric icon={PackageCheck} label="Active jobs" value="2" />
          <Metric icon={Clock} label="Avg delivery" value="24m" />
          <Metric icon={IndianRupee} label="Today earned" value="Rs 1,840" />
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Assigned Deliveries</h2>
              <p className="text-sm text-gray-500">Optimized for one-handed mobile use with 60px action targets.</p>
            </div>
            <Link href="/delivery/earnings" className="inline-flex min-h-12 items-center rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              Earnings
            </Link>
          </div>

          <div className="mt-5 grid gap-4">
            {tasks.map((task) => (
              <article key={task.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{task.id}</p>
                    <h3 className="mt-1 text-base font-bold text-gray-950">{task.restaurant}</h3>
                    <p className="mt-1 text-sm text-gray-500">Customer: {task.customer}</p>
                  </div>
                  <StatusBadge status={task.status} size="sm" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Info icon={MapPin} label="Distance" value={task.distance} />
                  <Info icon={Clock} label="ETA" value={task.eta} />
                  <Info icon={Star} label="Priority" value="Hot food" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <button onClick={() => toast.info(`Opening navigation for ${task.id}`)} className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-lg bg-[#1A3C5E] px-4 text-sm font-bold text-white transition hover:bg-[#15304d]">
                    <Navigation size={18} aria-hidden="true" />
                    Navigate
                  </button>
                  <button onClick={() => toast.info(`Calling ${task.customer}`)} className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50">
                    <Phone size={18} aria-hidden="true" />
                    Call
                  </button>
                  <button onClick={() => toast.success(`${task.id} marked complete`)} className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-lg bg-[#1E7E34] px-4 text-sm font-bold text-white transition hover:bg-[#17682a]">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    Mark Done
                  </button>
                </div>
              </article>
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-xl font-bold text-gray-950">{value}</p>
        </div>
        <Icon size={22} className="text-[#1A3C5E]" aria-hidden="true" />
      </div>
    </div>
  )
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <Icon size={14} aria-hidden="true" />
        {label}
      </div>
      <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
    </div>
  )
}
