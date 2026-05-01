"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, CheckCircle } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { toast } from "sonner"

export default function CustomerCartPage() {
  const router = useRouter()
  const { items: cartItems, tableId, updateQuantity, removeItem, total, clearCart } = useCart()
  const [isBooking, setIsBooking] = useState(false)

  const handleQuantityChange = (menuItemId: string, delta: number) => {
    const item = cartItems.find(i => i.menuItemId === menuItemId)
    if (item) {
      updateQuantity(menuItemId, Math.max(0, item.quantity + delta))
    }
  }

  const handleRemoveItem = (menuItemId: string) => {
    removeItem(menuItemId)
  }

  const handleConfirmBooking = async () => {
    if (!tableId) {
      toast.error('No table selected. Please select a table first.')
      router.push('/customer/home')
      return
    }

    setIsBooking(true)
    try {
      // Mock booking confirmation (in production, POST to /bookings endpoint)
      toast.success('✓ Booking confirmed! Your table is reserved.')
      setTimeout(() => {
        clearCart()
        router.push('/customer/home')
      }, 1500)
    } catch (err) {
      toast.error('Failed to confirm booking')
      setIsBooking(false)
    }
  }

  return (
    <PageWrapper title="Your Order" subtitle={tableId ? `Table: ${tableId}` : "Review before booking"}>
      <div className="mb-6 flex items-center justify-between">
        {tableId && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Table {tableId} Selected</span>
          </motion.div>
        )}
        <ThemeToggle />
      </div>

      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Add some delicious items to get started</p>
          <Button
            onClick={() => router.push("/customer/menu")}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white"
          >
            Browse Menu
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Cart Items */}
          <div className="space-y-3">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.menuItemId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-surface-800 rounded-md p-4 border border-gray-100 dark:border-surface-700 flex items-center gap-4"
                >
                  {/* Image placeholder */}
                  <div className="w-20 h-20 bg-gray-100 dark:bg-surface-700 rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag size={24} className="text-gray-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">₹{item.price}</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(item.menuItemId, -1)}
                      className="w-8 h-8 bg-gray-100 dark:bg-surface-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-surface-600 transition-colors"
                    >
                      <Minus size={14} />
                    </motion.button>
                    <span className="w-8 text-center font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(item.menuItemId, 1)}
                      className="w-8 h-8 bg-gray-100 dark:bg-surface-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-surface-600 transition-colors"
                    >
                      <Plus size={14} />
                    </motion.button>
                  </div>

                  {/* Price */}
                  <div className="text-right min-w-15">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  {/* Remove */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveItem(item.menuItemId)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Price Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-surface-800 rounded-md p-6 border border-gray-100 dark:border-surface-700 space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">₹{total().toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 dark:border-surface-700 pt-3 flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">₹{total().toFixed(2)}</span>
            </div>
          </motion.div>

          {/* Booking Info */}
          {tableId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4 border border-blue-200 dark:border-blue-800"
            >
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ✓ Your table ({tableId}) will be reserved for 2 hours after confirming your order.
              </p>
            </motion.div>
          )}

          {/* Confirm Booking Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleConfirmBooking}
              disabled={isBooking || !tableId}
              className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-semibold text-lg rounded-xl"
            >
              {isBooking ? 'Confirming...' : 'Confirm Booking'}
              {!isBooking && <ArrowRight size={20} className="ml-2" />}
            </Button>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  )
}
