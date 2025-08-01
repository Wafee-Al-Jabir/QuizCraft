"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard, StaggeredContainer } from "@/components/ui/micro-interactions"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SimpleThemeToggle } from "@/components/ui/theme-toggle"
import { BookOpen, Plus, FileText, Users, BarChart3, LogOut, Settings, TrendingUp, Trash2, HelpCircle, UserPlus, Trophy, Upload, Download, Copy, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { signOut } from "@/lib/auth-actions"
import { getQuizzes, getQuizStats, publishQuiz, deleteQuiz } from "@/lib/quiz-actions"
import { DashboardLoading } from "@/components/ui/loading"
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

type SortOption = 'alphabetical' | 'published' | 'date'

export function DashboardContent({ user }: DashboardContentProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [stats, setStats] = useState<QuizStats>({
    totalQuizzes: 0,
    publishedQuizzes: 0,
    totalQuestions: 0,
    totalParticipants: 0,
    averageScore: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importJson, setImportJson] = useState("")
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportJson, setExportJson] = useState('')
  const [exportingQuizId, setExportingQuizId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [userQuizzes, quizStats] = await Promise.all([getQuizzes(user.id), getQuizStats(user.id)])

        setQuizzes(userQuizzes)
        setStats({
          totalQuizzes: quizStats.totalQuizzes,
          publishedQuizzes: quizStats.publishedQuizzes,
          totalQuestions: quizStats.totalQuestions,
          totalParticipants: quizStats.totalParticipants,
          averageScore: quizStats.averageScore,
        })
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

  const handleExportQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId)
    if (!quiz) return

    const exportData = {
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map(q => ({
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswers: q.correctAnswers,
        settings: q.settings,
        ...(q.image && { image: q.image })
      })),
      settings: quiz.settings
    }
    
    const jsonString = JSON.stringify(exportData, null, 2)
    setExportJson(jsonString)
    setExportingQuizId(quizId)
    setShowExportModal(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportJson)
      alert('Quiz JSON copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = exportJson
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        alert('Quiz JSON copied to clipboard!')
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
        alert('Copy failed. Please manually select and copy the text.')
      }
      document.body.removeChild(textArea)
    }
  }

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const success = await deleteQuiz(quizId)
      if (success) {
        const deletedQuiz = quizzes.find(q => q.id === quizId)
        setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId))

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalQuizzes: prev.totalQuizzes - 1,
          publishedQuizzes: deletedQuiz?.published ? prev.publishedQuizzes - 1 : prev.publishedQuizzes,
          totalQuestions: prev.totalQuestions - (deletedQuiz?.questions.length || 0),
          totalParticipants: prev.totalParticipants - (deletedQuiz?.participants?.length || 0),
        }))
      } else {
        alert("Failed to delete quiz. Please try again.")
      }
    } catch (error) {
      console.error("Failed to delete quiz:", error)
      alert("An error occurred while deleting the quiz.")
    }
  }

  const handleImportQuiz = async () => {
    try {
      const quizData = JSON.parse(importJson)
      
      // Validate required fields
      if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
        alert("Invalid quiz format. Please ensure the JSON includes 'title' and 'questions' array.")
        return
      }

      // Redirect to create quiz page with imported data
      const encodedData = encodeURIComponent(JSON.stringify(quizData))
      window.location.href = `/quiz/create?import=${encodedData}`
    } catch (error) {
      alert("Invalid JSON format. Please check your data and try again.")
    }
  }

  // Sort quizzes based on selected option
  const sortedQuizzes = [...quizzes].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.title.localeCompare(b.title)
      case 'published':
        if (a.published === b.published) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return a.published ? -1 : 1
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'alphabetical': return 'Alphabetical'
      case 'published': return 'Published/Unpublished'
      case 'date': return 'Date Created'
      default: return 'Date Created'
    }
  }

  const getTagColor = (tag: string) => {
    const colorMap: { [key: string]: string } = {
      'a': 'bg-red-500', 'b': 'bg-blue-500', 'c': 'bg-green-500', 'd': 'bg-yellow-500',
      'e': 'bg-purple-500', 'f': 'bg-pink-500', 'g': 'bg-indigo-500', 'h': 'bg-teal-500',
      'i': 'bg-orange-500', 'j': 'bg-cyan-500', 'k': 'bg-lime-500', 'l': 'bg-amber-500',
      'm': 'bg-emerald-500', 'n': 'bg-violet-500', 'o': 'bg-rose-500', 'p': 'bg-sky-500',
      'q': 'bg-fuchsia-500', 'r': 'bg-slate-500', 's': 'bg-zinc-500', 't': 'bg-neutral-500',
      'u': 'bg-stone-500', 'v': 'bg-red-600', 'w': 'bg-blue-600', 'x': 'bg-green-600',
      'y': 'bg-yellow-600', 'z': 'bg-purple-600'
    }
    const firstLetter = tag.toLowerCase().charAt(0)
    return colorMap[firstLetter] || 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-background/95 transition-all duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-gray-200 dark:border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold font-zen-dots bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">QuizCraft</h1>
              <p className="text-xs sm:text-sm font-zen-dots text-gray-500 dark:text-gray-400 -mt-1">Test your IQ with us</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/badges">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                    >
                      <Trophy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Badges</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
            <SimpleThemeToggle />
            <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 font-medium">
              Welcome, {user.firstName} {user.lastName}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-9 w-9"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <StaggeredContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8" staggerDelay={0.1}>
          <AnimatedCard hoverEffect="lift" className="bg-gradient-to-br from-gray-50 to-white dark:from-card dark:to-card/50 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Quizzes</CardTitle>
              <motion.div 
                className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FileText className="h-4 w-4 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                {stats.totalQuizzes}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">{stats.publishedQuizzes} published</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard hoverEffect="lift" className="bg-gradient-to-br from-gray-50 to-white dark:from-card dark:to-card/50 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Questions</CardTitle>
              <motion.div 
                className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-md"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <BarChart3 className="h-4 w-4 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 dark:from-green-400 dark:to-green-500 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              >
                {stats.totalQuestions}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">Across all quizzes</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard hoverEffect="lift" className="bg-gradient-to-br from-gray-50 to-white dark:from-card dark:to-card/50 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Participants</CardTitle>
              <motion.div 
                className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Users className="h-4 w-4 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                {stats.totalParticipants}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">All-time participants</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard hoverEffect="lift" className="bg-gradient-to-br from-gray-50 to-white dark:from-card dark:to-card/50 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Score</CardTitle>
              <motion.div 
                className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <TrendingUp className="h-4 w-4 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              >
                {Math.round(stats.averageScore || 0)}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">Points per participant</p>
            </CardContent>
          </AnimatedCard>
        </StaggeredContainer>



        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="hidden sm:block text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">Your Quizzes</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex gap-2">
              <Link href="/quiz/join" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto bg-gradient-to-r from-gray-50 to-white dark:from-card dark:to-card/80 border-2 border-gray-200 dark:border-border hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-150 hover:scale-105">
                  <UserPlus className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden sm:inline font-medium">Join Quiz</span>
                  <span className="sm:hidden font-medium">Join</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-gradient-to-r from-gray-50 to-white dark:from-card dark:to-card/80 border-2 border-gray-200 dark:border-border hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-150">
                    <span className="hidden sm:inline font-medium">Order: {getSortLabel(sortBy)}</span> 
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
                    Alphabetical
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('published')}>
                    Published/Unpublished
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date')}>
                    Date Created
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto bg-gradient-to-r from-gray-50 to-white dark:from-card dark:to-card/80 border-2 border-gray-200 dark:border-border hover:border-green-300 dark:hover:border-green-500 hover:shadow-lg transition-all duration-150 hover:scale-105">
                  <Upload className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                  <span className="hidden sm:inline font-medium">Import Quiz</span>
                  <span className="sm:hidden font-medium">Import</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import Quiz from JSON</DialogTitle>
                  <DialogDescription>
                    Paste your quiz JSON data below to import a quiz.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Paste your quiz JSON here..."
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImportQuiz} disabled={!importJson.trim()}>
                      Import Quiz
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Link href="/quiz/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-150 hover:scale-105 border-0">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline font-medium">Create New Quiz</span>
                <span className="sm:hidden font-medium">Create</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Quizzes List */}
        {isLoading ? (
          <DashboardLoading />
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first quiz or join an existing one</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/quiz/join" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Quiz
                  </Button>
                </Link>
                <Link href="/quiz/create" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Quiz
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl">{quiz.title}</CardTitle>
                      <CardDescription className="text-sm sm:text-base">{quiz.description}</CardDescription>
                      {quiz.tags && quiz.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {quiz.tags.map((tag, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center gap-2 sm:gap-2">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleExportQuiz(quiz.id)}>
                          <Download className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Export</span>
                        </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleTogglePublish(quiz.id, quiz.published)}>
                                <span className="hidden sm:inline">{quiz.published ? "Unpublish" : "Publish"}</span>
                                <span className="sm:hidden">{quiz.published ? "Unpub" : "Pub"}</span>
                                <HelpCircle className="h-3 w-3 ml-1 opacity-50" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                {quiz.published 
                                  ? "Make this quiz private and remove it from public discovery" 
                                  : "Make this quiz publicly available for others to discover and join"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            quiz.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {quiz.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/quiz/${quiz.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                        >
                          <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                        <Link href={`/quiz/${quiz.id}/host`}>
                          <Button size="sm">
                            <span className="hidden sm:inline">Host Quiz</span>
                            <span className="sm:hidden">Host</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2">
                    <span>{quiz.questions.length} questions</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">
                      {quiz.questions.filter((q) => q.type === "single-choice").length} single choice,{" "}
                      {quiz.questions.filter((q) => q.type === "multiple-choice").length} multiple choice
                    </span>
                    <span className="sm:hidden">
                      {quiz.questions.filter((q) => q.type === "single-choice").length}SC, {quiz.questions.filter((q) => q.type === "multiple-choice").length}MC
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>{quiz.participants?.length || 0} participants</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
                    <span className="sm:hidden">{new Date(quiz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    {quiz.settings.showLeaderboard && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" /> 
                          <span className="hidden sm:inline">Leaderboard enabled</span>
                          <span className="sm:hidden">Leaderboard</span>
                        </span>
                      </>
                    )}
                  </div>
                  {quiz.participants && quiz.participants.length > 0 && (
                    <div className="mt-2 text-xs sm:text-sm text-gray-500">
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

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="bg-black border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Quiz</DialogTitle>
            <DialogDescription>
              Copy the JSON below to import this quiz elsewhere
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={exportJson}
                readOnly
                className="font-mono text-xs bg-gray-900 border-gray-700 min-h-[300px]"
                placeholder="Quiz JSON will appear here..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>
                Close
              </Button>
              <Button onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
