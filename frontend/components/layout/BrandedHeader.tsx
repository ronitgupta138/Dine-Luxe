"use client";

import { useBranding } from "@/hooks/useBranding";
import Image from "next/image";

export function BrandedHeader() {
  const { branding } = useBranding();

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {branding?.logoUrl ? (
            <Image
              src={branding.logoUrl}
              alt="Logo"
              width={32}
              height={32}
              className="rounded"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-[#1A3C5E]" />
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {branding?.appNameDisplay || "DineLuxe"}
            </h1>
            {branding?.tagline && (
              <p className="text-xs text-gray-500">{branding.tagline}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
