import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import { SignInForm } from "@/components/auth/signin-form"

export default async function SignInPage() {
  const user = await getCurrentUser()
  
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <SignInForm />
    </div>
  )
}
