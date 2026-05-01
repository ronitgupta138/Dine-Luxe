import { redirect } from "next/navigation"

export default function MisspelledStaffDashboardRedirect() {
  redirect("/staff/manager/dashboard")
}
