"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { CheckCircle, X, Star, Download, Share, Home, ShoppingBag, Camera } from "lucide-react"
import { toast } from "sonner"

interface OrderData {
  id: string
  restaurantName: string
  tableLabel?: string
  items: { name: string; quantity: number; unitPrice: number }[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  createdAt: string
}

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    apiClient.get<OrderData>(`/orders/${orderId}`)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [orderId])

  useEffect(() => {
    if (!orderId) return
    // Show rating prompt after 1.5 seconds
    const timer = setTimeout(() => setShowRating(true), 1500)
    return () => clearTimeout(timer)
  }, [orderId])

  const handleSubmitRating = async () => {
    if (!orderId || rating === 0) return

    setSubmitting(true)
    try {
      await apiClient.post(`/reviews`, {
        orderId,
        overallRating: rating,
        textReview: reviewText || undefined,
        photos: photos.length > 0 ? photos : undefined,
      })
      toast.success("Review submitted")
      setShowRating(false)
    } catch (err) {
      console.error("Failed to submit review:", err)
      toast.error("Could not submit review in demo mode")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    setShowRating(false)
  }

  const handleGoHome = () => {
    router.push("/customer/home")
  }

  const handleViewOrders = () => {
    router.push("/customer/order/history")
  }

  const handleReorder = async () => {
    if (!order) return

    try {
      const items = order.items.map(item => ({
        menuItemId: item.name, // This would be the actual ID in a real implementation
        quantity: item.quantity,
      }))
      await apiClient.post("/cart/add", { items })
      router.push("/customer/cart")
    } catch (err) {
      console.error("Failed to reorder:", err)
      toast.error("Could not reorder in demo mode")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="skeleton w-full max-w-md h-96 mx-4 rounded-md" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Animation */}
      <div className="bg-gradient-to-b from-brand-primary to-brand-secondary px-5 pt-12 pb-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="flex flex-col items-center text-white"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle size={48} className="text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold"
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/80 mt-2 text-center"
          >
            Your order has been placed successfully
          </motion.p>
        </motion.div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {/* Order Summary */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-md shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Order ID</span>
              <span className="font-medium text-gray-900">{order.id.slice(-6).toUpperCase()}</span>
            </div>

            <div className="py-4 space-y-2">
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity} {item.name}
                  </span>
                  <span className="text-gray-900">?{item.quantity * item.unitPrice}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-sm text-gray-500">
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>Rs {order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax</span>
                <span>Rs {order.tax}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>Rs {order.total}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white rounded-md shadow-sm border border-gray-100 p-5"
        >
          <h3 className="font-semibold text-gray-900 mb-4">What would you like to do next?</h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleGoHome}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Home size={24} className="text-brand-primary" />
              <span className="text-sm font-medium text-gray-700">Go Home</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleViewOrders}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ShoppingBag size={24} className="text-brand-primary" />
              <span className="text-sm font-medium text-gray-700">View Orders</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Rating Modal */}
        <AnimatePresence>
          {showRating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="bg-white rounded-t-2xl sm:rounded-md w-full max-w-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Rate your experience</h3>
                  <button
                    onClick={handleSkip}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Star Rating */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        size={32}
                        className={cn(
                          "transition-colors",
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    </motion.button>
                  ))}
                </div>

                {/* Review Text */}
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write a review (optional, min 10 chars if filled)"
                  className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  rows={3}
                />

                {/* Photo Upload */}
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Add photos (optional)</p>
                  <div className="flex gap-2">
                    {photos.length < 3 && (
                      <button onClick={() => toast.info("Photo upload is disabled in demo mode")} className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:border-brand-primary hover:text-brand-primary transition-colors">
                        <Camera size={20} />
                      </button>
                    )}
                    {photos.map((photo, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl overflow-hidden">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Skip
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitRating}
                    disabled={rating === 0 || submitting}
                    className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
