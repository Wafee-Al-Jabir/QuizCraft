import { notFound, redirect } from "next/navigation"
import { getCurrentUserServer } from "@/lib/auth-server"
import { getQuiz } from "@/lib/quiz-actions"
import { QuizEditForm } from "@/components/quiz/quiz-edit-form"

interface QuizEditPageProps {
  params: {
    id: string
  }
}

export default async function QuizEditPage({ params }: QuizEditPageProps) {
  const user = await getCurrentUserServer()
  if (!user) {
    redirect("/auth/signin")
  }

  const quiz = await getQuiz(params.id)
  if (!quiz) {
    notFound()
  }

  // Check if user owns this quiz
  if (quiz.userId !== user.id) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <QuizEditForm quiz={quiz} user={user} />
    </div>
  )
}