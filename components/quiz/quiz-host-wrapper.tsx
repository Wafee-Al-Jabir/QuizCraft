"use client"

import { useRouter } from "next/navigation"
import { QuizHost } from "./quiz-host"
import type { Quiz } from "@/lib/types"

interface QuizHostWrapperProps {
  quiz: Quiz
}

export function QuizHostWrapper({ quiz }: QuizHostWrapperProps) {
  const router = useRouter()
  
  const handleClose = () => {
    router.push("/dashboard")
  }

  return <QuizHost quiz={quiz} onClose={handleClose} />
}