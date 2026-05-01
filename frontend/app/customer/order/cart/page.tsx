"use client"

import { useState } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import CartItem from '@/components/customer/CartItem'
import { Button } from '@/components/ui/button'

type CartLine = {
  id: string
  name: string
  description: string
  price: number
  quantity: number
}

const initialItems: CartLine[] = [
  { id: '1', name: 'Citrus braised salmon', description: 'Market greens, lemon oil', price: 24, quantity: 1 },
  { id: '2', name: 'Charred maitake', description: 'Miso butter, herbs', price: 14, quantity: 2 },
]

export default function Page() {
  const [items, setItems] = useState(initialItems)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <PageWrapper title="Your cart" subtitle="Order">
      <div className="space-y-4">
        {items.map((item) => (
          <CartItem
            key={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            quantity={item.quantity}
            onIncrease={() =>
              setItems((prev) =>
                prev.map((entry) =>
                  entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
                ),
              )
            }
            onDecrease={() =>
              setItems((prev) =>
                prev.map((entry) =>
                  entry.id === item.id
                    ? { ...entry, quantity: Math.max(1, entry.quantity - 1) }
                    : entry,
                ),
              )
            }
            onRemove={() => setItems((prev) => prev.filter((entry) => entry.id !== item.id))}
          />
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between rounded-md border border-ink/10 bg-paper/90 p-6 shadow-soft">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Subtotal</p>
          <p className="mt-2 text-2xl font-semibold text-ink">${subtotal.toFixed(2)}</p>
        </div>
        <Button>Checkout</Button>
      </div>
    </PageWrapper>
  )
}
