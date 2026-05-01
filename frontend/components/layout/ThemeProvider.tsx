"use client";

import { useEffect } from "react";
import { useBranding } from "@/hooks/useBranding";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { branding } = useBranding();

  useEffect(() => {
    if (!branding) return;
    const root = document.documentElement;
    root.style.setProperty("--color-primary", branding.primaryColor);
    root.style.setProperty("--color-accent", branding.secondaryColor);
  }, [branding]);

  return <>{children}</>;
}
