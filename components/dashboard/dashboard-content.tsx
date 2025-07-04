"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Plus, FileText, Users, BarChart3, LogOut, Settings, TrendingUp } from "lucide-react"
import { signOut } from "@/lib/auth-actions"
import { getQuizzes, getQuizStats, publishQuiz } from "@/lib/quiz-actions"
import type { User, Quiz } from "@/lib/types"

interface QuizStats {
  totalQuizzes: number
  publishedQuizzes: number
  totalQuestions: number
  totalParticipants: number
  averageScore: number
}

interface DashboardContentProps {
  user: User
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [stats, setStats] = useState<QuizStats>({
    totalQuizzes: 0,
    publishedQuizzes: 0,
    totalQuestions: 0,
    totalParticipants: 0,
    averageScore: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [userQuizzes, quizStats] = await Promise.all([getQuizzes(user.id), getQuizStats(user.id)])

        setQuizzes(userQuizzes)
        setStats(quizStats)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [user.id])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
    try {
      const success = await publishQuiz(quizId, !currentStatus)
      if (success) {
        setQuizzes(quizzes.map((quiz) => (quiz.id === quizId ? { ...quiz, published: !currentStatus } : quiz)))

        // Update stats
        setStats((prev) => ({
          ...prev,
          publishedQuizzes: currentStatus ? prev.publishedQuizzes - 1 : prev.publishedQuizzes + 1,
        }))
      }
    } catch (error) {
      console.error("Failed to toggle quiz publication:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">QuizCraft</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.firstName} {user.lastName}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.publishedQuizzes} published</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all quizzes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              <p className="text-xs text-muted-foreground mt-1">All-time participants</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.averageScore || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Points per participant</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Quizzes</h2>
          <Link href="/quiz/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Quiz
            </Button>
          </Link>
        </div>

        {/* Quizzes List */}
        {isLoading ? (
          <div className="text-center py-8">Loading your quizzes...</div>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first quiz</p>
              <Link href="/quiz/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleTogglePublish(quiz.id, quiz.published)}>
                        {quiz.published ? "Unpublish" : "Publish"}
                      </Button>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          quiz.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {quiz.published ? "Published" : "Draft"}
                      </span>
                      <Link href={`/quiz/${quiz.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/quiz/${quiz.id}/take`}>
                        <Button size="sm">Take Quiz</Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-2">
                    <span>{quiz.questions.length} questions</span>
                    <span>•</span>
                    <span>
                      {quiz.questions.filter((q) => q.type === "single-choice").length} single choice,{" "}
                      {quiz.questions.filter((q) => q.type === "multiple-choice").length} multiple choice
                    </span>
                    <span>•</span>
                    <span>{quiz.participants?.length || 0} participants</span>
                    <span>•</span>
                    <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
                    {quiz.settings.showLeaderboard && (
                      <>
                        <span>•</span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" /> Leaderboard enabled
                        </span>
                      </>
                    )}
                  </div>
                  {quiz.participants && quiz.participants.length > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                      Average score:{" "}
                      {Math.round(quiz.participants.reduce((sum, p) => sum + p.score, 0) / quiz.participants.length)}{" "}
                      points
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
