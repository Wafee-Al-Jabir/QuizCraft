import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return <DashboardContent user={user} />
}
