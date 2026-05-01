import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase-server";
 
export default async function RootPage() {
  const supabase = await getServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();
 
  if (!session) redirect("/auth/login");
 
  const role = session.user.user_metadata?.role as string | undefined;
 
  switch (role) {
    case "super_admin":   redirect("/admin/dashboard");
    case "owner":         redirect("/owner/dashboard");
    case "manager":
    case "host":
    case "waiter":
    case "chef":
    case "cashier":       redirect("/staff/dashboard");
    case "customer":      redirect("/home");
    default:              redirect("/auth/login");
  }
}
