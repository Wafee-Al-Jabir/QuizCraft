import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import { QuizCreateForm } from "@/components/quiz/quiz-create-form"

export default async function CreateQuizPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-black">
      <QuizCreateForm user={user} />
    </div>
  )
}
