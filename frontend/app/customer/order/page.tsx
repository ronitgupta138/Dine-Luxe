"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Clock, ArrowRight, MapPin } from "lucide-react"

interface Order {
  id: string
  restaurantName: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  status: "pending" | "preparing" | "ready" | "served"
  date: string
  tableNumber?: string
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    restaurantName: "Spice Garden",
    items: [
      { name: "Butter Chicken", quantity: 1, price: 349 },
      { name: "Garlic Naan", quantity: 2, price: 138 },
    ],
    total: 487,
    status: "preparing" as const,
    date: new Date().toISOString(),
    tableNumber: "T5",
  },
  {
    id: "ORD-002",
    restaurantName: "Tandoori Nights",
    items: [
      { name: "Chicken Biryani", quantity: 1, price: 299 },
      { name: "Raita", quantity: 1, price: 49 },
    ],
    total: 348,
    status: "served" as const,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-003",
    restaurantName: "Curry Leaf",
    items: [
      { name: "Paneer Tikka", quantity: 1, price: 279 },
      { name: "Dal Makhani", quantity: 1, price: 249 },
      { name: "Jeera Rice", quantity: 1, price: 149 },
    ],
    total: 677,
    status: "served" as const,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const statusSteps = [
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
  { status: "served", label: "Served" },
]

export default function CustomerOrderPage() {
  const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing")

  const ongoingOrders = mockOrders.filter((o) => o.status !== "served")
  const pastOrders = mockOrders.filter((o) => o.status === "served")


  return (
    <PageWrapper title="Your Orders" subtitle="Track and manage your orders">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("ongoing")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
            activeTab === "ongoing"
              ? "bg-brand-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Ongoing ({ongoingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
            activeTab === "history"
              ? "bg-brand-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          History ({pastOrders.length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {activeTab === "ongoing" ? (
          ongoingOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No active orders</h3>
              <p className="text-sm text-gray-500 mb-6">Your current orders will appear here</p>
            </motion.div>
          ) : (
            ongoingOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-md border border-gray-100 p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.restaurantName}</h3>
                    <p className="text-sm text-gray-500">{order.id}</p>
                  </div>
                  <StatusBadge status="preparing" />
                </div>

                {/* Table Info */}
                {order.tableNumber && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-brand-primary/5 rounded-xl">
                    <MapPin size={18} className="text-brand-primary" />
                    <span className="font-medium text-gray-900">Table {order.tableNumber}</span>
                  </div>
                )}

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-4">
                  {statusSteps.map((step, index) => (
                    <div key={step.status} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index === 0
                              ? "bg-brand-primary text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-xs mt-1 text-gray-500">{step.label}</span>
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Items */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-gray-900">Rs {item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between font-semibold text-lg border-t border-gray-100 pt-4">
                  <span>Total</span>
                  <span>Rs {order.total}</span>
                </div>
              </motion.div>
            ))
          )
        ) : (
          pastOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-md border border-gray-100 p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{order.restaurantName}</h3>
                  <p className="text-sm text-gray-500">{order.id}</p>
                </div>
                <StatusBadge status="served" />

              </div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-gray-900">Rs {item.price}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between font-semibold border-t border-gray-100 pt-4">
                <span>Total</span>
                <span>Rs {order.total}</span>
              </div>

              {/* Reorder Button */}
              <Button
                variant="outline"
                className="w-full mt-4"
              >
                Reorder
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </PageWrapper>
  )
}
