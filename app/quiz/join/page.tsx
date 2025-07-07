"use client"

import { QuizParticipant } from "@/components/quiz/quiz-participant"
import { SimpleThemeToggle } from "@/components/ui/theme-toggle"
import { useRouter } from "next/navigation"

export default function QuizJoinPage() {
  const router = useRouter()
  
  const handleClose = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-black dark:bg-gray-900 transition-colors duration-300">
      <div className="absolute top-4 right-4 z-10">
        <SimpleThemeToggle />
      </div>
      <QuizParticipant onClose={handleClose} />
    </div>
  )
}