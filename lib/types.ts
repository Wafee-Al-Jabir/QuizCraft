import type { ObjectId } from "mongodb"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  createdAt: string
}

export type QuestionType = "single-choice" | "multiple-choice" | "true-false" | "open-ended" | "poll"

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  options: string[]
  correctAnswers: number[] // Changed to support multiple correct answers
  settings: {
    timeLimit?: number // in seconds
    points: number
    showLeaderboardAfter: boolean // Whether to show leaderboard after this question
  }
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  userId: string
  published: boolean
  participants: QuizParticipant[]
  settings: {
    showLeaderboard: boolean
    randomizeQuestions: boolean
    randomizeOptions: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface QuizParticipant {
  id: string
  name: string
  score: number
  answers: {
    questionId: string
    selectedOptions: number[]
    timeToAnswer?: number // Time taken to answer in seconds
    isCorrect: boolean
    pointsEarned: number
  }[]
}

export interface QuizSession {
  id: string
  quizId: string
  participantName: string
  answers: QuizAnswer[]
  score: number
  completedAt?: string
  timeSpent: number
}

export interface QuizAnswer {
  questionId: string
  selectedAnswers: number[]
  textAnswer?: string
  ratingAnswer?: number
  timeSpent: number
  isCorrect: boolean
  pointsEarned: number
}

export interface LeaderboardEntry {
  participantName: string
  score: number
  correctAnswers: number
  totalQuestions: number
  timeSpent: number
  rank: number
}

// MongoDB Document interfaces
export interface UserDocument extends Omit<User, "id"> {
  _id?: ObjectId
}

export interface QuizDocument extends Omit<Quiz, "id" | "userId"> {
  _id?: ObjectId
  userId: ObjectId
}

export interface QuizParticipantDocument extends Omit<QuizParticipant, "id"> {
  _id?: ObjectId
}
