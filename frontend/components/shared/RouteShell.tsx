"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import {
  CalendarCheck,
  ChefHat,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Map,
  MessageSquare,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react"
import PageWrapper from "@/components/layout/PageWrapper"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { titleCase } from "@/lib/utils"
import { toast } from "sonner"

type RouteShellProps = {
  title?: string
  subtitle?: string
  statusLabel?: string
  children?: ReactNode
}

type ShellConfig = {
  icon: React.ElementType
  status: string
  summary: string
  metrics: Array<{ label: string; value: string; status?: string }>
  actions: string[]
  feed: string[]
}

function makeTitle(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  const clean = parts.filter((part) => !part.startsWith("["))
  const last = clean[clean.length - 1] || "Overview"
  return titleCase(last)
}

function makeSubtitle(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length <= 1) return "Workspace"
  return titleCase(parts.slice(0, -1).join(" / "))
}

function configFor(pathname: string): ShellConfig {
  if (pathname.includes("booking")) {
    return {
      icon: CalendarCheck,
      status: "confirmed",
      summary: "Booking flow with party size, date/time selection, reservation history, and live status updates.",
      metrics: [
        { label: "Upcoming", value: "8", status: "info" },
        { label: "Seated today", value: "42", status: "success" },
        { label: "No-show risk", value: "3", status: "warning" },
      ],
      actions: ["Confirm reservation", "Assign table", "Send reminder"],
      feed: ["7:30 PM party of 4 confirmed", "Table B2 cleaned", "Customer requested window seating"],
    }
  }

  if (pathname.includes("queue")) {
    return {
      icon: ClipboardList,
      status: "active",
      summary: "Host queue board with wait timers, arrival state, and table assignment controls.",
      metrics: [
        { label: "Waiting", value: "14", status: "warning" },
        { label: "Geo-arrived", value: "5", status: "success" },
        { label: "Avg wait", value: "18m", status: "info" },
      ],
      actions: ["Mark arrived", "Assign table", "Notify guest"],
      feed: ["Q-18 arrived nearby", "Party of 2 assigned to A4", "Q-21 notified by SMS"],
    }
  }

  if (pathname.includes("floor") || pathname.includes("tables")) {
    return {
      icon: Map,
      status: "live",
      summary: "Live table map with color-coded status, shape-aware tables, and 300ms transitions.",
      metrics: [
        { label: "Available", value: "12", status: "available" },
        { label: "Occupied", value: "18", status: "occupied" },
        { label: "Cleaning", value: "4", status: "cleaning" },
      ],
      actions: ["Change status", "Open order", "Move booking"],
      feed: ["Table A1 moved to occupied", "Table C4 needs cleaning", "VIP booking pinned to booth"],
    }
  }

  if (pathname.includes("menu")) {
    return {
      icon: ChefHat,
      status: "active",
      summary: "Menu workspace for categories, item availability, photos, dietary tags, and sold-out states.",
      metrics: [
        { label: "Available items", value: "86", status: "success" },
        { label: "Sold out", value: "7", status: "danger" },
        { label: "Low stock", value: "11", status: "warning" },
      ],
      actions: ["Add item", "Toggle sold out", "Update pricing"],
      feed: ["Paneer tikka marked popular", "Mango lassi sold out", "Desserts category reordered"],
    }
  }

  if (pathname.includes("payment")) {
    return {
      icon: CreditCard,
      status: "ready",
      summary: "Payment surface with split tenders, item-level rating, receipt access, and success animation states.",
      metrics: [
        { label: "Open bills", value: "9", status: "warning" },
        { label: "Paid today", value: "128", status: "success" },
        { label: "Refund checks", value: "2", status: "info" },
      ],
      actions: ["Take payment", "Split bill", "Print receipt"],
      feed: ["UPI payment confirmed", "Table B6 receipt sent", "Item rating requested"],
    }
  }

  if (pathname.includes("profile") || pathname.includes("customers")) {
    return {
      icon: Users,
      status: "active",
      summary: "Customer profile center with history, favorites, support, loyalty, and saved addresses.",
      metrics: [
        { label: "Profiles", value: "2.4k", status: "info" },
        { label: "Loyalty active", value: "68%", status: "success" },
        { label: "Support open", value: "6", status: "warning" },
      ],
      actions: ["View history", "Resolve support", "Update segment"],
      feed: ["Customer added favorite", "Support thread assigned", "Loyalty reward redeemed"],
    }
  }

  if (pathname.includes("report") || pathname.includes("platform-health")) {
    return {
      icon: LayoutDashboard,
      status: "healthy",
      summary: "Reporting view with trend analysis, exports, health checks, and performance exceptions.",
      metrics: [
        { label: "Exports", value: "4", status: "info" },
        { label: "Healthy APIs", value: "99.9%", status: "success" },
        { label: "Alerts", value: "3", status: "warning" },
      ],
      actions: ["Export report", "Compare period", "Open alert"],
      feed: ["Revenue report generated", "Cancellation trend flagged", "API latency returned to normal"],
    }
  }

  if (pathname.includes("order")) {
    return {
      icon: ShoppingBag,
      status: "preparing",
      summary: "Order lifecycle view with kitchen status, waiter updates, tracking, and receipt handoff.",
      metrics: [
        { label: "Active", value: "24", status: "preparing" },
        { label: "Ready", value: "6", status: "ready" },
        { label: "Overdue", value: "2", status: "danger" },
      ],
      actions: ["Update status", "Call waiter", "Open receipt"],
      feed: ["Order #1208 moved to preparing", "Kitchen marked dosa ready", "Payment completed"],
    }
  }

  if (pathname.includes("support") || pathname.includes("review")) {
    return {
      icon: MessageSquare,
      status: "flagged",
      summary: "Anonymous review and support surface that protects identity while preserving branch context.",
      metrics: [
        { label: "Positive", value: "42", status: "success" },
        { label: "Neutral", value: "18", status: "neutral" },
        { label: "Negative", value: "5", status: "danger" },
      ],
      actions: ["Flag review", "Assign follow-up", "Filter branch"],
      feed: ["A waiter submitted neutral feedback", "Negative review flagged", "Owner response drafted"],
    }
  }

  if (pathname.includes("scan")) {
    return {
      icon: QrCode,
      status: "ready",
      summary: "QR entry point for customer restaurant discovery, menu loading, and white-label branding.",
      metrics: [
        { label: "Scans today", value: "312", status: "success" },
        { label: "Menus opened", value: "276", status: "info" },
        { label: "Deep links", value: "91", status: "neutral" },
      ],
      actions: ["Open menu", "Join queue", "Book table"],
      feed: ["Branding cache loaded", "Menu opened from QR", "Customer started booking"],
    }
  }

  return {
    icon: ShieldCheck,
    status: "ready",
    summary: "Operational workspace prepared with responsive layout, accessible controls, status labels, and real-time-ready sections.",
    metrics: [
      { label: "Tasks", value: "12", status: "info" },
      { label: "Synced", value: "3m", status: "success" },
      { label: "Attention", value: "2", status: "warning" },
    ],
    actions: ["Review queue", "Assign owner", "Sync data"],
    feed: ["Workspace loaded", "Permissions checked", "Realtime channel ready"],
  }
}

export default function RouteShell({ title, subtitle, statusLabel, children }: RouteShellProps) {
  const pathname = usePathname() || "/"
  const resolvedTitle = title || makeTitle(pathname)
  const resolvedSubtitle = subtitle || makeSubtitle(pathname)
  const isAuth = pathname.startsWith("/auth")
  const config = configFor(pathname)
  const Icon = config.icon

  if (isAuth) {
    return (
      <div className="space-y-6 animate-rise">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">{resolvedSubtitle}</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-950">{resolvedTitle}</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Secure onboarding step with validation, focused inputs, OTP-ready progression, and persistent back navigation.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {["Basic details", "Personal details", "Security"].map((step, index) => (
            <div key={step} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A3C5E] text-sm font-bold text-white">{index + 1}</span>
              <h2 className="mt-4 text-sm font-bold text-gray-950">{step}</h2>
              <div className="mt-3 h-10 rounded-lg bg-gray-100 skeleton" />
              <div className="mt-2 h-10 rounded-lg bg-gray-100 skeleton" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <PageWrapper title={resolvedTitle} subtitle={resolvedSubtitle}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5">
          {children || (
            <>
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm animate-rise">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1A3C5E] text-white">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-gray-950">{resolvedTitle}</h2>
                      <p className="mt-1 max-w-2xl text-sm text-gray-600">{config.summary}</p>
                    </div>
                  </div>
                  <StatusBadge status={statusLabel || config.status} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {config.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{metric.label}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <strong className="text-2xl text-gray-950">{metric.value}</strong>
                      {metric.status && <StatusBadge status={metric.status} size="sm" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Primary Actions</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {config.actions.map((action, index) => (
                    <button
                      key={action}
                      onClick={() => toast.info(`${action} is ready for API wiring`)}
                      className={index === 0
                        ? "min-h-12 rounded-lg bg-[#1A3C5E] px-4 text-sm font-semibold text-white transition hover:bg-[#15304d]"
                        : "min-h-12 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Live Feed</h3>
            <div className="mt-4 space-y-3">
              {config.feed.map((item, index) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#E8A020]" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item}</p>
                    <p className="text-xs text-gray-500">{index + 1} min ago</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Experience Standards</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>48px minimum touch targets</li>
              <li>Status always has text plus color</li>
              <li>Animations respect reduced motion</li>
              <li>Responsive single-column mobile layout</li>
            </ul>
          </section>
        </aside>
      </div>
    </PageWrapper>
  )
}
