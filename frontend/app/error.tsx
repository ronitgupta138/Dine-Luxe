"use client"

interface ErrorPageProps {
  error: Error
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-lg rounded-md border border-ink/10 bg-paper/90 p-8 text-ink shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">System alert</p>
        <h1 className="mt-4 font-display text-3xl">Something slipped off the pass.</h1>
        <p className="mt-3 text-sm text-muted">
          {error?.message || 'An unexpected error occurred. Try reloading this view.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-soft transition hover:-translate-y-0.5"
            onClick={() => reset?.()}
          >
            Try again
          </button>
          <a
            className="rounded-full border border-ink/15 bg-paper/70 px-5 py-2.5 text-sm font-semibold text-ink"
            href="/"
          >
            Return home
          </a>
        </div>
      </div>
    </div>
  )
}

