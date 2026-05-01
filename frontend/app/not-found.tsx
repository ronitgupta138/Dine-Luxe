import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-lg rounded-md border border-ink/10 bg-paper/90 p-8 text-ink shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent2">Lost table</p>
        <h1 className="mt-4 font-display text-3xl">We could not find that route.</h1>
        <p className="mt-3 text-sm text-muted">
          The page may have moved or never existed. Head back to the main dining room.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-soft transition hover:-translate-y-0.5"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}
