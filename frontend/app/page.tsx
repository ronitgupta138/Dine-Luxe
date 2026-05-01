import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase-server";

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url?.startsWith("https://") && key && key !== "anon-key" && key.length > 40);
}

export default async function RootPage() {
  if (!isSupabaseConfigured()) redirect("/auth/login");

  const supabase = await getServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();
 
  if (!session) redirect("/auth/login");
 
  const role = session.user.user_metadata?.role as string | undefined;
 
  switch (role) {
    case "super_admin":   redirect("/admin/dashboard");
    case "owner":         redirect("/owner/dashboard");
    case "manager":       redirect("/staff/manager/dashboard");
    case "host":          redirect("/staff/host");
    case "waiter":        redirect("/staff/waiter");
    case "chef":          redirect("/staff/chef/kitchen");
    case "cashier":       redirect("/staff/cashier");
    case "customer":      redirect("/customer/home");
    case "delivery_partner": redirect("/delivery");
    default:              redirect("/auth/login");
  }
}
