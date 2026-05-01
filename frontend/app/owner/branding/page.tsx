"use client"

import { useMemo, useState } from "react"
import { Copy, ImagePlus, Link2, MonitorSmartphone, Palette, Smartphone } from "lucide-react"
import PageWrapper from "@/components/layout/PageWrapper"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type PreviewScreen = "Splash" | "Login" | "Home"

export default function OwnerBrandingPage() {
  const [primaryColor, setPrimaryColor] = useState("#1A3C5E")
  const [secondaryColor, setSecondaryColor] = useState("#E8A020")
  const [appName, setAppName] = useState("DineLuxe Bistro")
  const [tagline, setTagline] = useState("Fine dining, made effortless")
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [screen, setScreen] = useState<PreviewScreen>("Splash")
  const [shareCopied, setShareCopied] = useState(false)

  const previewVars = useMemo(() => ({
    "--preview-primary": primaryColor,
    "--preview-secondary": secondaryColor,
  }) as React.CSSProperties, [primaryColor, secondaryColor])

  const handleLogo = (file?: File) => {
    if (!file) return
    if (logoUrl) URL.revokeObjectURL(logoUrl)
    setLogoUrl(URL.createObjectURL(file))
  }

  const copyPreview = async () => {
    const url = `${window.location.origin}/owner/branding?preview=${encodeURIComponent(appName)}`
    await navigator.clipboard.writeText(url)
    setShareCopied(true)
    toast.success("Preview link copied")
    window.setTimeout(() => setShareCopied(false), 1800)
  }

  return (
    <PageWrapper
      title="Branding Preview"
      subtitle="Tune the white-label experience and preview customer screens before publishing"
      action={
        <button onClick={copyPreview} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#1A3C5E] px-4 text-sm font-semibold text-white transition hover:bg-[#15304d]">
          {shareCopied ? <Copy size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
          {shareCopied ? "Copied" : "Share Preview"}
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Palette className="text-[#1A3C5E]" size={20} aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold text-gray-950">Brand Setup</h2>
              <p className="text-sm text-gray-500">Changes update the phone preview instantly.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-800">Primary color</span>
              <span className="flex min-h-12 items-center gap-3 rounded-lg border border-gray-200 px-3">
                <input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
                <input value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="w-full bg-transparent text-sm font-medium outline-none" />
              </span>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-800">Secondary color</span>
              <span className="flex min-h-12 items-center gap-3 rounded-lg border border-gray-200 px-3">
                <input type="color" value={secondaryColor} onChange={(event) => setSecondaryColor(event.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
                <input value={secondaryColor} onChange={(event) => setSecondaryColor(event.target.value)} className="w-full bg-transparent text-sm font-medium outline-none" />
              </span>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-800">App name display</span>
              <input value={appName} onChange={(event) => setAppName(event.target.value)} className="min-h-12 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1A3C5E]" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-800">Tagline</span>
              <input value={tagline} onChange={(event) => setTagline(event.target.value)} className="min-h-12 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1A3C5E]" />
            </label>
          </div>

          <label className="flex min-h-28 cursor-pointer items-center justify-between gap-4 rounded-lg border border-dashed border-gray-300 p-4 transition hover:border-[#1A3C5E]">
            <span className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <ImagePlus size={20} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-gray-900">Logo upload</span>
                <span className="text-sm text-gray-500">PNG or SVG, previewed locally before S3 upload.</span>
              </span>
            </span>
            <input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="sr-only" onChange={(event) => handleLogo(event.target.files?.[0])} />
          </label>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Publish checklist</h3>
            <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
              <span>Header uses primary color</span>
              <span>CTA uses secondary color</span>
              <span>Logo appears in splash and header</span>
              <span>App name and tagline are readable</span>
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MonitorSmartphone size={20} className="text-[#1A3C5E]" aria-hidden="true" />
              <h2 className="text-base font-semibold text-gray-950">Live Phone Mockup</h2>
            </div>
            <Smartphone size={18} className="text-gray-400" aria-hidden="true" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["Splash", "Login", "Home"] as PreviewScreen[]).map((item) => (
              <button
                key={item}
                onClick={() => setScreen(item)}
                className={cn(
                  "min-h-11 rounded-lg text-sm font-semibold transition",
                  screen === item ? "bg-[#1A3C5E] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <div className="w-[300px] rounded-[34px] border-[10px] border-gray-950 bg-gray-950 shadow-lg">
              <div className="h-[610px] overflow-hidden rounded-[24px] bg-white" style={previewVars}>
                <PhonePreview screen={screen} appName={appName} tagline={tagline} logoUrl={logoUrl} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </PageWrapper>
  )
}

function BrandLogo({ logoUrl, appName }: { logoUrl: string | null; appName: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt={`${appName} logo`} className="h-16 w-16 rounded-md object-cover" />
  }

  return (
    <span className="flex h-16 w-16 items-center justify-center rounded-md bg-white/18 text-xl font-bold text-white">
      {appName.slice(0, 2).toUpperCase()}
    </span>
  )
}

function PhonePreview({ screen, appName, tagline, logoUrl }: { screen: PreviewScreen; appName: string; tagline: string; logoUrl: string | null }) {
  if (screen === "Splash") {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[var(--preview-primary)] px-8 text-center text-white">
        <div className="relative mb-7">
          <span className="absolute inset-0 animate-pulse-green rounded-md" />
          <BrandLogo logoUrl={logoUrl} appName={appName} />
        </div>
        <h3 className="text-3xl font-bold">{appName}</h3>
        <p className="mt-2 text-sm text-white/80">{tagline}</p>
        <div className="mt-10 flex gap-2">
          <span className="h-2 w-8 rounded-full bg-[var(--preview-secondary)]" />
          <span className="h-2 w-2 rounded-full bg-white/45" />
          <span className="h-2 w-2 rounded-full bg-white/45" />
        </div>
      </div>
    )
  }

  if (screen === "Login") {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <div className="bg-[var(--preview-primary)] px-6 pb-10 pt-12 text-white">
          <BrandLogo logoUrl={logoUrl} appName={appName} />
          <h3 className="mt-5 text-2xl font-bold">{appName}</h3>
          <p className="mt-1 text-sm text-white/80">{tagline}</p>
        </div>
        <div className="-mt-5 space-y-3 px-5">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="h-11 rounded-lg bg-gray-100" />
            <div className="mt-3 h-11 rounded-lg bg-gray-100" />
            <button onClick={() => toast.info("Preview sign-in tapped")} className="mt-4 h-12 w-full rounded-lg bg-[var(--preview-secondary)] text-sm font-bold text-gray-950">Sign In</button>
          </div>
          <p className="text-center text-xs text-gray-500">Create Account - Forgot Password</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="bg-[var(--preview-primary)] px-5 pb-5 pt-9 text-white">
        <div className="flex items-center gap-3">
          <BrandLogo logoUrl={logoUrl} appName={appName} />
          <div>
            <h3 className="text-lg font-bold">{appName}</h3>
            <p className="text-xs text-white/75">{tagline}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Recommended</p>
          <h4 className="mt-2 text-lg font-bold text-gray-950">Chef's tasting menu</h4>
          <button onClick={() => toast.info("Preview reservation tapped")} className="mt-4 h-11 rounded-lg bg-[var(--preview-secondary)] px-4 text-sm font-bold text-gray-950">Reserve table</button>
        </div>
        {["Live menu", "Queue status", "Order tracking"].map((item) => (
          <div key={item} className="rounded-lg bg-white p-4 text-sm font-semibold text-gray-800 shadow-sm">{item}</div>
        ))}
      </div>
    </div>
  )
}
