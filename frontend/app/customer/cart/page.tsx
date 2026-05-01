"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

const initialCartItems: CartItem[] = [
  {
    id: "1",
    name: "Butter Chicken",
    price: 349,
    quantity: 1,
    image: "/food/butter-chicken.jpg",
  },
  {
    id: "2",
    name: "Garlic Naan",
    price: 69,
    quantity: 2,
    image: "/food/garlic-naan.jpg",
  },
  {
    id: "3",
    name: "Dal Makhani",
    price: 249,
    quantity: 1,
    image: "/food/dal-makhani.jpg",
  },
]

export default function CustomerCartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter((item) => item.quantity > 0)
    )
  }

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + tax

  return (
    <PageWrapper title="Your Cart" subtitle="Review your order before checkout">
      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-sm text-gray-500 mb-6">Add some delicious items to get started</p>
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
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-md p-4 border border-gray-100 flex items-center gap-4"
                >
{/* Image placeholder */}
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag size={24} className="text-gray-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500">Rs {item.price}</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Minus size={14} />
                    </motion.button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={14} />
                    </motion.button>
                  </div>

                  {/* Price */}
                  <div className="text-right min-w-15">
                    <p className="font-semibold text-gray-900">Rs {item.price * item.quantity}</p>
                  </div>

                  {/* Remove */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            className="bg-white rounded-md p-6 border border-gray-100 space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">Rs {subtotal}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Tax (5%)</span>
              <span className="text-gray-900">Rs {tax}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">Rs {total}</span>
            </div>
          </motion.div>

          {/* Checkout Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={() => router.push("/customer/payment")}
              className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-lg rounded-xl"
            >
              Proceed to Checkout
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  )
}
