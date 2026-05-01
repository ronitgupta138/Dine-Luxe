"use client"

import { BottomNav } from "@/components/layout/BottomNav"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <main className="max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
