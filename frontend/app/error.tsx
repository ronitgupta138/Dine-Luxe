"use client"

interface ErrorPageProps {
  error: Error
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 text-slate-900">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <h1 className="text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-4 text-slate-600">{error?.message || 'An unexpected error occurred.'}</p>
        <button
          type="button"
          className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          onClick={() => reset?.()}
        >
          Try again
        </button>
      </div>
    </div>
  )
}

