export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-ink/10 bg-paper/90 p-8 shadow-soft">
        <div className="h-4 w-24 animate-pulse rounded-full bg-ink/10" />
        <div className="h-8 w-3/4 animate-pulse rounded-xl bg-ink/10" />
        <div className="h-3 w-full animate-pulse rounded-full bg-ink/10" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-ink/10" />
        <div className="h-10 w-full animate-pulse rounded-2xl bg-ink/10" />
      </div>
    </div>
  )
}
