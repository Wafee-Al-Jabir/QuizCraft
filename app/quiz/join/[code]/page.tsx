"use client"

import { QuizParticipantWithCode } from "@/components/quiz/quiz-participant-with-code"
import { SimpleThemeToggle } from "@/components/ui/theme-toggle"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function QuizJoinWithCodePage() {
  const router = useRouter()
  const params = useParams()
  const sessionCode = params.code as string
  
  const handleClose = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-black dark:bg-gray-900 transition-colors duration-300">
      <div className="absolute top-4 right-4 z-10">
        <SimpleThemeToggle />
      </div>
      <QuizParticipantWithCode sessionCode={sessionCode} onClose={handleClose} />
    </div>
  )
}