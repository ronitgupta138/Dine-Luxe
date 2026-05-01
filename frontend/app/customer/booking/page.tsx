"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, MapPin, Check } from "lucide-react"

const timeSlots = [
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", 
  "2:00 PM", "5:00 PM", "5:30 PM", "6:00 PM", 
  "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"
]

export default function CustomerBookingPage() {
  const router = useRouter()
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
    if (!selectedDate || !selectedTime) return

    setIsSubmitting(true)
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push("/customer/home")
  }

  return (
    <PageWrapper title="Book a Table" subtitle="Reserve your dining experience">
      <div className="space-y-6">
        {/* Date Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users size={18} />
            Party Size
          </h3>
          <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-xl">
            <button
              onClick={() => setPartySize(Math.max(1, partySize - 1))}
              className="w-12 h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{partySize}</p>
              <p className="text-sm text-gray-500">
                {partySize === 1 ? "Guest" : "Guests"}
              </p>
            </div>
            <button
              onClick={() => setPartySize(Math.min(10, partySize + 1))}
              className="w-12 h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
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
          <h3 className="font-semibold text-gray-900 mb-3">Special Requests</h3>
          <textarea
            placeholder="Any special occasions or seating preferences..."
            className="w-full h-24 p-4 bg-gray-50 rounded-xl border-0 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
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
            disabled={!selectedDate || !selectedTime || isSubmitting}
            className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-lg rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              "Booking..."
            ) : !selectedDate || !selectedTime ? (
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
