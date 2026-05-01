"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
 
interface Branding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  appNameDisplay: string;
  tagline: string | null;
  fontPreference: string;
  welcomeAnimation: string;
  receiptFooter: string | null;
}
 
const DEFAULT_BRANDING: Branding = {
  primaryColor: "#1A3C5E", secondaryColor: "#E8A020",
  logoUrl: null, bannerUrl: null,
  appNameDisplay: "DineLuxe", tagline: null,
  fontPreference: "Geist", welcomeAnimation: "food_standard", receiptFooter: null,
};
 
const CACHE_KEY = "restaurant_branding";
const CACHE_TTL = 60 * 60 * 1000;
 
interface BrandingContextValue {
  branding: Branding;
  loading: boolean;
  refresh: () => Promise<void>;
}
 
const BrandingContext = createContext<BrandingContextValue>({
  branding: DEFAULT_BRANDING, loading: false, refresh: async () => {},
});
 
function applyToCSS(b: Branding) {
  document.documentElement.style.setProperty("--brand-primary",   b.primaryColor);
  document.documentElement.style.setProperty("--brand-secondary", b.secondaryColor);
}
 
export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [loading,  setLoading]  = useState(false);
 
  const fetchFresh = useCallback(async (restaurantId: string) => {
    try {
      setLoading(true);
      const data = await apiClient.get<Branding>(`/restaurant/${restaurantId}/branding`);
      setBranding(data);
      applyToCSS(data);
      if (typeof window !== "undefined" && typeof window.localStorage?.setItem === "function") {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      }
    } catch { /* use defaults */ } finally { setLoading(false); }
  }, []);
 
  const load = useCallback(async (restaurantId: string) => {
    try {
      let cached: string | null = null;
      if (typeof window !== "undefined" && typeof window.localStorage?.getItem === "function") {
        cached = window.localStorage.getItem(CACHE_KEY);
      }
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setBranding(data);
          applyToCSS(data);
          fetchFresh(restaurantId); // background refresh
          return;
        }
      }
    } catch { /* skip cache */ }
    await fetchFresh(restaurantId);
  }, [fetchFresh]);
 
  useEffect(() => {
    const rid = new URLSearchParams(window.location.search).get("rid");
    if (rid) load(rid);
  }, [load]);
 
  const refresh = async () => {
    const rid = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("rid")
      : null;
    if (rid) {
      if (typeof window !== "undefined" && typeof window.localStorage?.removeItem === "function") {
        window.localStorage.removeItem(CACHE_KEY);
      }
      await fetchFresh(rid);
    }
  };
 
  return (
    <BrandingContext.Provider value={{ branding, loading, refresh }}>
      {children}
    </BrandingContext.Provider>
  );
}
 
export const useBrandingContext = () => useContext(BrandingContext);
