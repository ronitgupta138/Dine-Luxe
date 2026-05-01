let browserSupabase: any = null;
 
export async function getBrowserSupabase() {
  if (typeof window === "undefined") {
    throw new Error("Supabase browser client can only be created in the browser.");
  }
 
  if (!browserSupabase) {
    const { createBrowserClient } = await import("@supabase/ssr");
    browserSupabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
 
  return browserSupabase;
 }
