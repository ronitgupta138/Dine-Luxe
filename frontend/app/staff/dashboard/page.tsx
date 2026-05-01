import { redirect } from "next/navigation"

export default function StaffDashboardRedirect() {
  redirect("/staff/manager/dashboard")
}
