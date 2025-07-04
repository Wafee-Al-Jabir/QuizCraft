import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { QuizCreateForm } from "@/components/quiz/quiz-create-form"

export default async function CreateQuizPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizCreateForm user={user} />
    </div>
  )
}
