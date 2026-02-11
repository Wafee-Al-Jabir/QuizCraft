import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import { SignUpForm } from "@/components/auth/signup-form"

export default async function SignUpPage() {
  const user = await getCurrentUser()
  
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <SignUpForm />
    </div>
  )
}
