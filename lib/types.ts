import type { ObjectId } from "mongodb"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  createdAt: string
  streakData?: {
    currentStreak: number
    longestStreak: number
    lastActivityDate: string
    streakType: 'quiz_creation' | 'quiz_participation' | 'daily_login'
  }
}

export type QuestionType = "single-choice" | "multiple-choice" | "true-false" | "open-ended" | "poll"

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  image?: string // Optional image URL or file path
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

// Badge System
export type BadgeType = "quiz_creator" | "quiz_master" | "participant" | "streak" | "perfectionist" | "speed_demon" | "social_butterfly" | "explorer" | "achievement" | "special"

export interface Badge {
  id: string
  type: BadgeType
  name: string
  description: string
  icon: string
  color: string
  requirement: {
    type: "quiz_count" | "question_count" | "participant_count" | "perfect_score" | "speed" | "streak" | "exploration"
    value: number
    condition?: string
  }
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockedAt?: string
}

export interface UserBadge {
  badgeId: string
  unlockedAt: string
  progress?: number
  maxProgress?: number
}

export interface UserWithBadges extends User {
  badges: UserBadge[]
}
