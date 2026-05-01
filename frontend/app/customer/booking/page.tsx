"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Calendar, Clock, Users, Check } from "lucide-react"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Button } from "@/components/ui/button"
import CustomerTableSelector from "@/components/floor/CustomerTableSelector"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { useCart } from "@/hooks/useCart"

const timeSlots = [
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", 
  "2:00 PM", "5:00 PM", "5:30 PM", "6:00 PM", 
  "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"
]

export default function CustomerBookingPage() {
  const router = useRouter()
  const branchId = useCart((state) => state.branchId) ?? "demo-branch"
  const selectedTableId = useCart((state) => state.tableId)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [partySize, setPartySize] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date.toISOString().split("T")[0]
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      day: date.toLocaleDateString("en", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en", { month: "short" })
    }
  }

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Select a date and time first")
      return
    }

    if (!selectedTableId) {
      toast.error("Select a table first")
      return
    }

    setIsSubmitting(true)
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast.success("Booking details saved")
    router.push("/customer/cart")
  }

  return (
    <PageWrapper title="Book a Table" subtitle="Reserve your dining experience">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedTableId ? `Selected table: ${selectedTableId}` : "Select a table below to continue"}
        </div>
        <ThemeToggle />
      </div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-surface-700 dark:bg-surface-900"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select a table</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose an available table before confirming your booking.
              </p>
            </div>
          </div>

          <CustomerTableSelector branchId={branchId} />
        </motion.div>

        {/* Date Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Calendar size={18} />
            Select Date
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((date) => {
              const formatted = formatDate(date)
              const isSelected = selectedDate === date
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`shrink-0 w-16 h-20 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-brand-primary bg-brand-primary/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`text-center py-2 ${isSelected ? "text-brand-primary" : ""}`}>
                    <p className="text-xs font-medium uppercase">{formatted.day}</p>
                    <p className="text-xl font-bold">{formatted.date}</p>
                    <p className="text-xs">{formatted.month}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Time Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Clock size={18} />
            Select Time
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-gray-100 hover:border-gray-200 text-gray-600"
                  }`}
                >
                  {time}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Party Size */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Users size={18} />
            Party Size
          </h3>
          <div className="flex items-center justify-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-surface-800">
            <button
              onClick={() => setPartySize(Math.max(1, partySize - 1))}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:bg-gray-100 dark:border-surface-700 dark:bg-surface-900 dark:hover:bg-surface-700"
            >
              -
            </button>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{partySize}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {partySize === 1 ? "Guest" : "Guests"}
              </p>
            </div>
            <button
              onClick={() => setPartySize(Math.min(10, partySize + 1))}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:bg-gray-100 dark:border-surface-700 dark:bg-surface-900 dark:hover:bg-surface-700"
            >
              +
            </button>
          </div>
        </motion.div>

        {/* Special Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Special Requests</h3>
          <textarea
            placeholder="Any special occasions or seating preferences..."
            className="h-24 w-full resize-none rounded-xl border-0 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:bg-surface-800 dark:text-white"
          />
        </motion.div>

        {/* Book Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleBook}
            disabled={!selectedDate || !selectedTime || !selectedTableId || isSubmitting}
            className="h-14 w-full rounded-xl bg-brand-primary text-lg font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              "Booking..."
            ) : !selectedDate || !selectedTime || !selectedTableId ? (
              "Select date and time"
            ) : (
              <>
                Confirm Booking
                <Check size={20} className="ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
