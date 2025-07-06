import { redirect } from "next/navigation"
import { getQuiz } from "@/lib/quiz-actions"
import { getCurrentUserServer } from "@/lib/auth-server"
import { QuizHostWrapper } from "@/components/quiz/quiz-host-wrapper"

interface QuizHostPageProps {
  params: Promise<{ id: string }>
}

export default async function QuizHostPage({ params }: QuizHostPageProps) {
  const { id } = await params
  const user = await getCurrentUserServer()
  
  if (!user) {
    redirect("/auth/signin")
  }
  
  const quiz = await getQuiz(id)

  if (!quiz) {
    redirect("/dashboard")
  }
  
  // Check if user owns this quiz
  if (quiz.userId !== user.id) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizHostWrapper quiz={quiz} />
    </div>
  )
}