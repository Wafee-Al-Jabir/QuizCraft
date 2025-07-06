"use client"

import { QuizParticipant } from "@/components/quiz/quiz-participant"
import { useRouter } from "next/navigation"

export default function QuizJoinPage() {
  const router = useRouter()
  
  const handleClose = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizParticipant onClose={handleClose} />
    </div>
  )
}