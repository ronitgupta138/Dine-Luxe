import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'

import TopBar from '@/components/layout/TopBar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <Sidebar />

        <div className="flex flex-col">
          <TopBar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
