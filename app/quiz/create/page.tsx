import { redirect } from "next/navigation"
import { getCurrentUserServer } from "@/lib/auth-server"
import { QuizCreateForm } from "@/components/quiz/quiz-create-form"

export default async function CreateQuizPage() {
  const user = await getCurrentUserServer()

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-black">
      <QuizCreateForm user={user} />
    </div>
  )
}
