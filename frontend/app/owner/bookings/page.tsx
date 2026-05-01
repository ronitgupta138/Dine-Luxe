"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, Search, Filter, Check, X } from "lucide-react"

interface Booking {
  id: string
  customerName: string
  phone: string
  date: string
  time: string
  partySize: number
  tableNumber?: string
  status: "reserved" | "pending" | "cancelled" | "success"
  specialRequests?: string
}

const mockBookings: Booking[] = [
  {
    id: "BK-001",
    customerName: "John Doe",
    phone: "+91 98765 43210",
    date: "2024-01-15",
    time: "7:00 PM",
    partySize: 4,
    tableNumber: "T5",
    status: "reserved",
    specialRequests: "Birthday celebration",
  },
  {
    id: "BK-002",
    customerName: "Jane Smith",
    phone: "+91 98765 43211",
    date: "2024-01-15",
    time: "7:30 PM",
    partySize: 2,
    status: "pending",
  },
  {
    id: "BK-003",
    customerName: "Mike Johnson",
    phone: "+91 98765 43212",
    date: "2024-01-15",
    time: "8:00 PM",
    partySize: 6,
    tableNumber: "T8",
    status: "reserved",
  },
  {
    id: "BK-004",
    customerName: "Sarah Williams",
    phone: "+91 98765 43213",
    date: "2024-01-16",
    time: "12:30 PM",
    partySize: 3,
    tableNumber: "T3",
    status: "success",
  },
]

export default function OwnerBookingsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming")
  const [searchQuery, setSearchQuery] = useState("")

const upcomingBookings = mockBookings.filter((b) => b.status !== "success")
  const completedBookings = mockBookings.filter((b) => b.status === "success")

  const handleConfirm = (bookingId: string) => {
    // Handle confirm logic
    console.log("Confirm booking:", bookingId)
  }

  const handleCancel = (bookingId: string) => {
    // Handle cancel logic
    console.log("Cancel booking:", bookingId)
  }

  const filteredBookings = activeTab === "upcoming" ? upcomingBookings : completedBookings

  return (
    <PageWrapper title="Bookings" subtitle="Manage table reservations">
      {/* Search and Filter */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
        <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
          <Filter size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
            activeTab === "upcoming"
              ? "bg-brand-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
            activeTab === "completed"
              ? "bg-brand-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Completed ({completedBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{booking.customerName}</h3>
                <p className="text-sm text-gray-500">{booking.phone}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            {/* Details */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar size={14} />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock size={14} />
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Users size={14} />
                <span>{booking.partySize} guests</span>
              </div>
            </div>

            {/* Table */}
            {booking.tableNumber && (
              <div className="text-sm text-gray-600 mb-3">
                Table: <span className="font-medium">{booking.tableNumber}</span>
              </div>
            )}

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg mb-3">
                {booking.specialRequests}
              </div>
            )}

            {/* Actions */}
            {booking.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => handleConfirm(booking.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <Check size={14} className="mr-1" />
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancel(booking.id)}
                  className="flex-1 text-red-500 hover:bg-red-50"
                >
                  <X size={14} className="mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  )
}
