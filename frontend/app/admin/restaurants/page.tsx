"use client"

import { useMemo, useState } from "react"
import {
  Ban,
  Check,
  ChevronDown,
  Download,
  Eye,
  Mail,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import PageWrapper from "@/components/layout/PageWrapper"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type RestaurantStatus = "active" | "pending" | "suspended"

interface RestaurantRow {
  id: string
  logo: string
  name: string
  owner: string
  ownerEmail: string
  city: string
  cuisine: string
  status: RestaurantStatus
  joinedDate: string
  revenue: number
  branches: Array<{ name: string; address: string; manager: string; active: boolean }>
  staffReviews: Array<{ role: string; branch: string; sentiment: "positive" | "neutral" | "negative"; text: string }>
}

const restaurants: RestaurantRow[] = [
  {
    id: "rest-1",
    logo: "SG",
    name: "Spice Garden",
    owner: "Rajesh Kumar",
    ownerEmail: "rajesh@spicegarden.in",
    city: "Delhi",
    cuisine: "North Indian",
    status: "active",
    joinedDate: "2025-01-12",
    revenue: 1284000,
    branches: [
      { name: "Connaught Place", address: "Block A, Connaught Place", manager: "Nisha Rao", active: true },
      { name: "Saket", address: "Select Citywalk", manager: "Aman Verma", active: true },
    ],
    staffReviews: [
      { role: "Waiter", branch: "Connaught Place", sentiment: "positive", text: "Roster planning has improved over the last two weeks." },
      { role: "Chef", branch: "Saket", sentiment: "neutral", text: "Need clearer low-stock alerts before dinner rush." },
    ],
  },
  {
    id: "rest-2",
    logo: "CL",
    name: "Curry Leaf",
    owner: "Sneha Patel",
    ownerEmail: "sneha@curryleaf.in",
    city: "Mumbai",
    cuisine: "South Indian",
    status: "active",
    joinedDate: "2024-11-03",
    revenue: 1542000,
    branches: [{ name: "Bandra", address: "Hill Road", manager: "Farah Khan", active: true }],
    staffReviews: [{ role: "Host", branch: "Bandra", sentiment: "positive", text: "Queue assignment is smooth during weekend service." }],
  },
  {
    id: "rest-3",
    logo: "BH",
    name: "Biryani House",
    owner: "Amit Singh",
    ownerEmail: "amit@biryanihouse.in",
    city: "Hyderabad",
    cuisine: "Biryani",
    status: "pending",
    joinedDate: "2026-04-21",
    revenue: 0,
    branches: [{ name: "Hitech City", address: "Main Road", manager: "Pending", active: false }],
    staffReviews: [],
  },
  {
    id: "rest-4",
    logo: "TN",
    name: "Tandoori Nights",
    owner: "Priya Sharma",
    ownerEmail: "priya@tandoorinights.in",
    city: "Pune",
    cuisine: "Mughlai",
    status: "suspended",
    joinedDate: "2025-06-18",
    revenue: 842000,
    branches: [{ name: "Koregaon Park", address: "Lane 5", manager: "Rohit Mehra", active: false }],
    staffReviews: [{ role: "Cashier", branch: "Koregaon Park", sentiment: "negative", text: "Payment closure delays need owner attention." }],
  },
]

const statusOptions = ["all", "active", "pending", "suspended"]
const cuisineOptions = ["all", "North Indian", "South Indian", "Biryani", "Mughlai"]
const cityOptions = ["all", "Delhi", "Mumbai", "Hyderabad", "Pune"]

export default function AdminRestaurantsPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [cuisine, setCuisine] = useState("all")
  const [city, setCity] = useState("all")
  const [sortKey, setSortKey] = useState<keyof RestaurantRow>("revenue")
  const [selected, setSelected] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [detail, setDetail] = useState<RestaurantRow | null>(restaurants[0])

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return restaurants
      .filter((restaurant) => status === "all" || restaurant.status === status)
      .filter((restaurant) => cuisine === "all" || restaurant.cuisine === cuisine)
      .filter((restaurant) => city === "all" || restaurant.city === city)
      .filter((restaurant) => {
        if (!needle) return true
        return [restaurant.name, restaurant.owner, restaurant.ownerEmail, restaurant.city].some((value) =>
          value.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (typeof av === "number" && typeof bv === "number") return bv - av
        return String(av).localeCompare(String(bv))
      })
  }, [city, cuisine, search, sortKey, status])

  const toggleSelected = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const exportCsv = () => {
    const rows = [
      ["Name", "Owner", "Email", "City", "Cuisine", "Status", "Revenue"],
      ...filtered.map((restaurant) => [
        restaurant.name,
        restaurant.owner,
        restaurant.ownerEmail,
        restaurant.city,
        restaurant.cuisine,
        restaurant.status,
        restaurant.revenue.toString(),
      ]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "restaurants.csv"
    link.click()
    URL.revokeObjectURL(url)
    toast.success("CSV export started")
  }

  const bulkAction = (action: "approved" | "suspended") => {
    toast.success(`${selected.length} restaurant${selected.length === 1 ? "" : "s"} ${action}`)
    setSelected([])
  }

  const rowAction = (label: string, restaurant: RestaurantRow) => {
    if (label === "View details") {
      setDetail(restaurant)
      toast.info(`Showing ${restaurant.name}`)
      return
    }
    toast.success(`${label} action queued for ${restaurant.name}`)
  }

  return (
    <PageWrapper
      title="Restaurant Management"
      subtitle="Review tenants, approve onboarding, inspect branches, and contact owners"
      action={
        <button onClick={exportCsv} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#1A3C5E] px-4 text-sm font-semibold text-white transition hover:bg-[#15304d]">
          <Download size={16} aria-hidden="true" />
          Export CSV
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap gap-3">
              <label className="flex min-h-12 flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3">
                <Search size={16} className="text-gray-500" aria-hidden="true" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search name, owner, email, city" />
              </label>
              <FilterSelect label="Status" value={status} options={statusOptions} onChange={setStatus} />
              <FilterSelect label="Cuisine" value={cuisine} options={cuisineOptions} onChange={setCuisine} />
              <FilterSelect label="City" value={city} options={cityOptions} onChange={setCity} />
            </div>

            {selected.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm">
                <strong>{selected.length} selected</strong>
                <button onClick={() => bulkAction("approved")} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1E7E34] px-3 font-semibold text-white"><Check size={15} />Bulk approve</button>
                <button onClick={() => bulkAction("suspended")} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#C0392B] px-3 font-semibold text-white"><Ban size={15} />Bulk suspend</button>
                <button onClick={() => setSelected([])} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 font-semibold text-gray-700"><X size={15} />Clear</button>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3"><span className="sr-only">Select</span></th>
                    {[
                      ["name", "Name"],
                      ["owner", "Owner"],
                      ["branches", "Branches"],
                      ["status", "Status"],
                      ["joinedDate", "Joined Date"],
                      ["revenue", "Revenue"],
                    ].map(([key, label]) => (
                      <th key={key} className="px-4 py-3">
                        <button onClick={() => setSortKey(key as keyof RestaurantRow)} className="inline-flex items-center gap-1 font-semibold">
                          {label}
                          <ChevronDown size={13} aria-hidden="true" />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((restaurant) => (
                    <tr key={restaurant.id} className="align-top transition hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selected.includes(restaurant.id)} onChange={() => toggleSelected(restaurant.id)} className="h-5 w-5 rounded border-gray-300" aria-label={`Select ${restaurant.name}`} />
                      </td>
                      <td className="px-4 py-4">
                        <button onClick={() => setExpanded(expanded === restaurant.id ? null : restaurant.id)} className="flex items-center gap-3 text-left">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A3C5E] text-sm font-bold text-white">{restaurant.logo}</span>
                          <span>
                            <span className="block font-semibold text-gray-950">{restaurant.name}</span>
                            <span className="text-xs text-gray-500">{restaurant.cuisine} - {restaurant.city}</span>
                          </span>
                        </button>
                        {expanded === restaurant.id && (
                          <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                            {restaurant.branches.map((branch) => (
                              <p key={branch.name} className="py-1">
                                <strong>{branch.name}:</strong> {branch.address}, manager {branch.manager}
                              </p>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-800">{restaurant.owner}</p>
                        <p className="text-xs text-gray-500">{restaurant.ownerEmail}</p>
                      </td>
                      <td className="px-4 py-4 text-gray-700">{restaurant.branches.length}</td>
                      <td className="px-4 py-4"><StatusBadge status={restaurant.status} size="sm" /></td>
                      <td className="px-4 py-4 text-gray-700">{new Date(restaurant.joinedDate).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-4 font-semibold text-gray-950">Rs {restaurant.revenue.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <IconButton label="View details" onClick={() => rowAction("View details", restaurant)} icon={Eye} />
                          {restaurant.status === "pending" && <IconButton label="Approve" onClick={() => rowAction("Approve", restaurant)} icon={Check} />}
                          <IconButton label="Suspend" onClick={() => rowAction("Suspend", restaurant)} icon={Ban} danger />
                          <IconButton label="Contact owner" onClick={() => rowAction("Contact owner", restaurant)} icon={Mail} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-gray-200 bg-white shadow-sm xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)] xl:overflow-auto">
          {detail && (
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1A3C5E] text-base font-bold text-white">{detail.logo}</span>
                  <h2 className="mt-4 text-xl font-bold text-gray-950">{detail.name}</h2>
                  <p className="text-sm text-gray-500">{detail.owner} - {detail.ownerEmail}</p>
                </div>
                <StatusBadge status={detail.status} size="sm" />
              </div>

              <PanelSection title="Branches">
                <div className="space-y-3">
                  {detail.branches.map((branch) => (
                    <div key={branch.name} className="rounded-lg border border-gray-200 p-3">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-gray-900">{branch.name}</strong>
                        <StatusBadge status={branch.active ? "active" : "inactive"} size="sm" />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{branch.address}</p>
                      <p className="mt-2 text-xs text-gray-500">Manager: {branch.manager}</p>
                    </div>
                  ))}
                </div>
              </PanelSection>

              <PanelSection title="Analytics">
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Revenue" value={`Rs ${detail.revenue.toLocaleString("en-IN")}`} />
                  <Metric label="Orders" value={String(Math.max(0, Math.round(detail.revenue / 720)))} />
                  <Metric label="Top dish" value="Paneer tikka" />
                  <Metric label="Rating" value={detail.status === "pending" ? "Pending" : "4.7"} />
                </div>
              </PanelSection>

              <PanelSection title="Anonymous Staff Review">
                <div className="space-y-3">
                  {detail.staffReviews.length === 0 && <p className="text-sm text-gray-500">No staff reviews submitted yet.</p>}
                  {detail.staffReviews.map((review) => (
                    <div key={`${review.role}-${review.text}`} className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-600">{review.branch} - A {review.role} says...</p>
                        <StatusBadge status={review.sentiment} size="sm" />
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{review.text}</p>
                    </div>
                  ))}
                </div>
              </PanelSection>
            </div>
          )}
        </aside>
      </div>
    </PageWrapper>
  )
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="flex min-h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
      <SlidersHorizontal size={15} className="text-gray-500" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="bg-transparent text-sm font-medium capitalize text-gray-800 outline-none">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function IconButton({ label, icon: Icon, onClick, danger }: { label: string; icon: React.ElementType; onClick?: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={cn("flex min-h-12 min-w-12 items-center justify-center rounded-lg transition", danger ? "text-[#C0392B] hover:bg-red-50" : "text-gray-600 hover:bg-gray-100")}>
      <Icon size={17} aria-hidden="true" />
    </button>
  )
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 border-t border-gray-100 pt-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-950">{value}</p>
    </div>
  )
}
