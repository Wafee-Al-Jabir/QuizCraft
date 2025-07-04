import { redirect } from "next/navigation"
import { getQuiz } from "@/lib/quiz-actions"
import { QuizTaker } from "@/components/quiz/quiz-taker"

interface QuizTakePageProps {
  params: Promise<{ id: string }>
}

export default async function QuizTakePage({ params }: QuizTakePageProps) {
  const { id } = await params
  const quiz = await getQuiz(id)

  if (!quiz) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizTaker quiz={quiz} />
    </div>
  )
}
