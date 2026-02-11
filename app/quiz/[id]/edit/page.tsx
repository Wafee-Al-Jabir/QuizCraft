import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import { getQuiz } from "@/lib/quiz-actions"
import { QuizEditForm } from "@/components/quiz/quiz-edit-form"

interface QuizEditPageProps {
  params: Promise<{ id: string }>
}

export default async function QuizEditPage({ params }: QuizEditPageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const quiz = await getQuiz(id)
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