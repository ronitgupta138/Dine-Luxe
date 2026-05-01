import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f0e6]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(232,160,32,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(26,60,94,0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-60 w-60 rounded-full bg-[#e8a020]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-[#1a3c5e]/20 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}
