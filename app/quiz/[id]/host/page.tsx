import { redirect } from "next/navigation"
import { getQuiz } from "@/lib/quiz-actions"
import { getCurrentUserServer } from "@/lib/auth-server"
import { QuizHostWrapper } from "@/components/quiz/quiz-host-wrapper"
import { SimpleThemeToggle } from "@/components/ui/theme-toggle"

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-['Poppins']">
      <div className="absolute top-6 right-4 z-10">
        <SimpleThemeToggle />
      </div>
      <QuizHostWrapper quiz={quiz} />
    </div>
  )
}