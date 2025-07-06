import { redirect } from "next/navigation"
import { getCurrentUserServer } from "@/lib/auth-server"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const user = await getCurrentUserServer()

  if (!user) {
    redirect("/auth/signin")
  }

  return <DashboardContent user={user} />
}
