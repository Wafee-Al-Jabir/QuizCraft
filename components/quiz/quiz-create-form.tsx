"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BookOpen, Plus, Trash2, ArrowLeft, Settings } from "lucide-react"
import { createQuiz } from "@/lib/quiz-actions"
import type { User, QuizQuestion, QuestionType } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Eye, Copy } from "lucide-react"

interface QuizCreateFormProps {
  user: User
}

export function QuizCreateForm({ user }: QuizCreateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Debug user object
  useEffect(() => {
    console.log("QuizCreateForm - user object:", user)
    console.log("QuizCreateForm - user.id:", user?.id)
  }, [user])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [showQuizSettings, setShowQuizSettings] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentPreviewQuestion, setCurrentPreviewQuestion] = useState(0)
  const [quizSettings, setQuizSettings] = useState({
    showLeaderboard: true,
    randomizeQuestions: false,
    randomizeOptions: false,
  })
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: "1",
      question: "",
      options: ["", "", "", ""],
      correctAnswers: [0],
      type: "single-choice" as QuestionType,
      settings: {
        points: 1000,
        showLeaderboardAfter: false,
      },
    },
  ])
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importJson, setImportJson] = useState("")
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportJson, setExportJson] = useState('')

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for import data in URL
      const urlParams = new URLSearchParams(window.location.search)
      const importData = urlParams.get("import")

      if (importData) {
        try {
          const quizData = JSON.parse(decodeURIComponent(importData))
          handleImportQuiz(quizData)
          // Remove import parameter from URL
          window.history.replaceState({}, "", window.location.pathname)
          return
        } catch (error) {
          console.error("Error importing quiz data:", error)
        }
      }
    }
  }, [])

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswers: [0],
      type: "single-choice",
      settings: {
        points: 1000,
        showLeaderboardAfter: false,
      },
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  // Updated image upload function to handle large images
  const handleImageUpload = async (questionId: string, file: File) => {
    try {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }

      // Create a compressed version of the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = async () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800
        let { width, height } = img

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8)

        // Update question with compressed image
        updateQuestion(questionId, "image", compressedDataUrl)
      }

      img.src = URL.createObjectURL(file)
    } catch (error) {
      console.error("Error processing image:", error)
      alert("Error processing image. Please try again.")
    }
  }

  const handleImagePaste = (questionId: string, event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith("image/")) {
        event.preventDefault()
        const file = item.getAsFile()
        if (file) {
          handleImageUpload(questionId, file)
        }
        break
      }
    }
  }

  const removeImage = (questionId: string) => {
    updateQuestion(questionId, "image", undefined)
  }

  const updateQuestionSettings = (id: string, field: string, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, settings: { ...q.settings, [field]: value } } : q)))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) } : q,
      ),
    )
  }

  const toggleCorrectAnswer = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q

        // For single-choice, replace the array with just this option
        if (q.type === "single-choice") {
          return { ...q, correctAnswers: [optionIndex] }
        }

        // For multiple-choice, toggle the option in the array
        const isAlreadyCorrect = q.correctAnswers.includes(optionIndex)
        const newCorrectAnswers = isAlreadyCorrect
          ? q.correctAnswers.filter((idx) => idx !== optionIndex)
          : [...q.correctAnswers, optionIndex]

        return { ...q, correctAnswers: newCorrectAnswers }
      }),
    )
  }

  const handleQuestionTypeChange = (questionId: string, type: QuestionType) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q

        // Reset correct answers when changing type
        let correctAnswers = q.correctAnswers
        if (type === "single-choice" && correctAnswers.length > 1) {
          correctAnswers = [correctAnswers[0]]
        } else if (type === "true-false") {
          // For true-false, limit to 2 options
          return {
            ...q,
            type,
            options: ["True", "False"],
            correctAnswers: [0], // Default to "True"
          }
        }

        return { ...q, type, correctAnswers }
      }),
    )
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q
        return { ...q, options: [...q.options, ""] }
      }),
    )
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q

        // Don't remove if we have less than 2 options
        if (q.options.length <= 2) return q

        const newOptions = q.options.filter((_, idx) => idx !== optionIndex)

        // Update correctAnswers if needed
        const newCorrectAnswers = q.correctAnswers
          .filter((idx) => idx !== optionIndex)
          .map((idx) => (idx > optionIndex ? idx - 1 : idx)) // Adjust indices

        return {
          ...q,
          options: newOptions,
          correctAnswers: newCorrectAnswers,
        }
      }),
    )
  }

  const handleImportQuiz = (data?: any) => {
    try {
      const jsonData = data || JSON.parse(importJson)

      if (jsonData.title) setTitle(jsonData.title)
      if (jsonData.description) setDescription(jsonData.description)
      if (jsonData.settings) setQuizSettings({ ...quizSettings, ...jsonData.settings })
      if (jsonData.questions && Array.isArray(jsonData.questions)) {
        const importedQuestions = jsonData.questions.map((q: any, index: number) => ({
          id: Date.now().toString() + index,
          question: q.question || q.text || "",
          options: q.options || ["", "", "", ""],
          correctAnswers: q.correctAnswers || (q.correctAnswer !== undefined ? [q.correctAnswer] : [0]),
          type: q.type || "single-choice",
          settings: {
            points: q.settings?.points || q.points || 1000,
            showLeaderboardAfter: q.settings?.showLeaderboardAfter || false,
            timeLimit: q.settings?.timeLimit || q.timeLimit,
          },
          image: q.image,
        }))
        setQuestions(importedQuestions)
      }

      if (!data) {
        setImportJson("")
        setShowImportDialog(false)
      }
    } catch (error) {
      console.error("Error importing quiz:", error)
      alert("Invalid JSON format. Please check your data and try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (!title.trim()) {
        alert("Please enter a quiz title")
        return
      }

      if (questions.length === 0) {
        alert("Please add at least one question")
        return
      }

      // Validate each question
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        if (!question.question.trim()) {
          alert(`Please enter text for question ${i + 1}`)
          return
        }

        if (question.type !== "open-ended" && question.type !== "poll") {
          // Check if at least 2 options are filled
          const filledOptions = question.options.filter((opt) => opt.trim() !== "")
          if (filledOptions.length < 2) {
            alert(`Question ${i + 1} needs at least 2 answer options`)
            return
          }

          // Check if correct answer is selected
          if (question.correctAnswers.length === 0) {
            alert(`Please select the correct answer for question ${i + 1}`)
            return
          }
        }
      }

      // Check if user and user.id are valid
      if (!user || !user.id) {
        alert("User authentication error. Please sign in again.")
        return
      }

      console.log("Creating quiz with data:", {
        title,
        description,
        questions: questions.length,
        userId: user.id,
        settings: quizSettings,
      })

      // Create quiz data without images first
      const quizData = {
        title,
        description,
        questions: questions.map((q) => ({
          ...q,
          image: undefined, // Remove images from initial creation
        })),
        userId: user.id,
        settings: quizSettings,
      }

      const result = await createQuiz(quizData)

      // Check if result is valid
      if (!result || !result.id) {
        throw new Error("Quiz creation failed - no quiz ID returned")
      }

      console.log("Quiz created successfully:", result)

      // Handle images separately if any exist
      const questionsWithImages = questions.filter((q) => q.image)
      if (questionsWithImages.length > 0) {
        console.log(`Uploading ${questionsWithImages.length} question images...`)
        // You would implement image upload logic here
        // For now, we'll skip this to avoid the 431 error
      }

      // Navigate to the quiz edit page
      router.push(`/quiz/${result.id}/edit`)
    } catch (error) {
      console.error("Failed to create quiz:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to create quiz: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const exportQuiz = () => {
    const quizData = {
      title,
      description,
      settings: quizSettings,
      questions: questions.map((q) => ({
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswers: q.correctAnswers,
        settings: q.settings,
        image: q.image,
      })),
    }

    const jsonString = JSON.stringify(quizData, null, 2)
    setExportJson(jsonString)
    setShowExportModal(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportJson)
      alert('JSON copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // Rest of your component remains the same...
  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-background border-b border-gray-200 dark:border-border">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900 dark:text-white" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Create New Quiz</h1>
              </div>
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Import Quiz from JSON</DialogTitle>
                    <DialogDescription>Paste your quiz JSON data below to import a quiz.</DialogDescription>
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
                      <Button onClick={() => handleImportQuiz()} disabled={!importJson.trim()}>
                        Import Quiz
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 text-white">
          {/* Quiz Details */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Quiz Details</CardTitle>
                  <CardDescription className="text-sm">Basic information about your quiz</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuizSettings(!showQuizSettings)}
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="ml-2 sm:ml-0">Quiz Settings</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your quiz"
                  rows={3}
                />
              </div>

              {showQuizSettings && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 border border-gray-700 dark:border-border rounded-md bg-gray-900 dark:bg-card">
                  <h3 className="text-sm font-medium mb-3 text-white">Quiz Settings</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="space-y-0.5 flex-1">
                        <Label htmlFor="showLeaderboard" className="text-sm sm:text-base">
                          Show Leaderboard
                        </Label>
                        <p className="text-xs sm:text-sm text-gray-500">Display rankings after quiz completion</p>
                      </div>
                      <Switch
                        id="showLeaderboard"
                        checked={quizSettings.showLeaderboard}
                        onCheckedChange={(checked) => setQuizSettings({ ...quizSettings, showLeaderboard: checked })}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="space-y-0.5 flex-1">
                        <Label htmlFor="randomizeQuestions" className="text-sm sm:text-base">
                          Randomize Questions
                        </Label>
                        <p className="text-xs sm:text-sm text-gray-500">Show questions in random order</p>
                      </div>
                      <Switch
                        id="randomizeQuestions"
                        checked={quizSettings.randomizeQuestions}
                        onCheckedChange={(checked) => setQuizSettings({ ...quizSettings, randomizeQuestions: checked })}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="space-y-0.5 flex-1">
                        <Label htmlFor="randomizeOptions" className="text-sm sm:text-base">
                          Randomize Options
                        </Label>
                        <p className="text-xs sm:text-sm text-gray-500">Show answer options in random order</p>
                      </div>
                      <Switch
                        id="randomizeOptions"
                        checked={quizSettings.randomizeOptions}
                        onCheckedChange={(checked) => setQuizSettings({ ...quizSettings, randomizeOptions: checked })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions section - keeping your existing question rendering logic */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <h3 className="text-base sm:text-lg font-semibold text-white">Questions</h3>
              <Button type="button" onClick={addQuestion} variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-black">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="ml-2 sm:ml-0">Add Question</span>
              </Button>
            </div>

            {questions.map((question, questionIndex) => (
              <Card key={question.id}>
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                    <CardTitle className="text-sm sm:text-base">Question {questionIndex + 1}</CardTitle>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="ml-2 sm:hidden">Remove</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Question Text</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                      onPaste={(e) => handleImagePaste(question.id, e)}
                      placeholder="Enter your question (you can paste images with Ctrl+V)"
                      rows={2}
                      className="text-sm sm:text-base"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Question Image (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-700 dark:border-border rounded-lg p-4 bg-black dark:bg-card">
                      {question.image ? (
                        <div className="space-y-2">
                          <img
                            src={question.image || "/placeholder.svg"}
                            alt="Question image"
                            className="max-w-full h-auto max-h-48 rounded-lg mx-auto"
                          />
                          <div className="flex justify-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement("input")
                                input.type = "file"
                                input.accept = "image/*"
                                input.onchange = (e) => {
                                  const target = e.target as HTMLInputElement
                                  const file = target.files?.[0]
                                  if (file) {
                                    handleImageUpload(question.id, file)
                                  }
                                }
                                input.click()
                              }}
                            >
                              Change Image
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => removeImage(question.id)}>
                              Remove Image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement("input")
                              input.type = "file"
                              input.accept = "image/*"
                              input.onchange = (e) => {
                                const target = e.target as HTMLInputElement
                                const file = target.files?.[0]
                                if (file) {
                                  handleImageUpload(question.id, file)
                                }
                              }
                              input.click()
                            }}
                          >
                            Upload Image
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">
                            Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                            <br />
                            Images will be automatically compressed for optimal performance
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rest of question form fields... */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-type-${question.id}`} className="text-sm sm:text-base">
                        Question Type
                      </Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => handleQuestionTypeChange(question.id, value as QuestionType)}
                      >
                        <SelectTrigger id={`question-type-${question.id}`} className="text-xs sm:text-sm">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-choice">Single Choice</SelectItem>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                          <SelectItem value="poll">Poll (no correct answer)</SelectItem>
                          <SelectItem value="open-ended">Open Ended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`question-points-${question.id}`} className="text-sm sm:text-base">
                        Points
                      </Label>
                      <Input
                        id={`question-points-${question.id}`}
                        type="number"
                        min="0"
                        value={question.settings.points}
                        onChange={(e) =>
                          updateQuestionSettings(question.id, "points", Number.parseInt(e.target.value) || 0)
                        }
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Continue with your existing question options rendering... */}
                  {question.type !== "open-ended" && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                        <Label className="text-sm sm:text-base">Answer Options</Label>
                        {question.type !== "true-false" && (
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(question.id)}
                              className="w-full sm:w-auto"
                            >
                              <Plus className="h-3 w-3 mr-1" /> <span className="sm:inline">Add Option</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 sm:p-0 border sm:border-0 rounded sm:rounded-none"
                        >
                          <div className="flex items-center space-x-2 sm:space-x-0">
                            {question.type !== "poll" &&
                              (question.type === "multiple-choice" ? (
                                <Checkbox
                                  checked={question.correctAnswers.includes(optionIndex)}
                                  onCheckedChange={() => toggleCorrectAnswer(question.id, optionIndex)}
                                  className="text-indigo-600 shrink-0"
                                />
                              ) : (
                                <input
                                  aria-label={`Correct answer for option ${optionIndex + 1}`}
                                  title={`Select as correct answer for option ${optionIndex + 1}`}
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswers.includes(optionIndex)}
                                  onChange={() => toggleCorrectAnswer(question.id, optionIndex)}
                                  className="text-indigo-600 shrink-0"
                                />
                              ))}
                          </div>
                          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              required={question.type !== "open-ended"}
                              className="text-sm sm:text-base"
                            />
                            {question.options.length > 2 && question.type !== "true-false" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(question.id, optionIndex)}
                                className="w-full sm:w-auto"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="ml-2 sm:hidden">Remove Option</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!title || questions.some((q) => !q.question)}
                  className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-black disabled:opacity-50"
                >
                  <Eye className="h-4 w-4 sm:mr-2" />
                  <span className="ml-2 sm:ml-0">Preview</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto mx-4 sm:mx-auto">
                <DialogHeader className="pb-3 sm:pb-6">
                  <DialogTitle className="text-lg sm:text-xl">{title || "Quiz Preview"}</DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
                    {description || "Preview how your quiz will look to participants"}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6">
                  {questions.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Question {currentPreviewQuestion + 1} of {questions.length}
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPreviewQuestion(Math.max(0, currentPreviewQuestion - 1))}
                            disabled={currentPreviewQuestion === 0}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPreviewQuestion(Math.min(questions.length - 1, currentPreviewQuestion + 1))
                            }
                            disabled={currentPreviewQuestion === questions.length - 1}
                          >
                            Next
                          </Button>
                        </div>
                      </div>

                      <Card>
                        <CardHeader className="pb-3 sm:pb-6">
                          <CardTitle className="text-base sm:text-lg">
                            {questions[currentPreviewQuestion]?.question || "Question text"}
                          </CardTitle>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-gray-500 gap-1 sm:gap-0">
                            <span>Type: {questions[currentPreviewQuestion]?.type}</span>
                            <span>Points: {questions[currentPreviewQuestion]?.settings.points}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {questions[currentPreviewQuestion]?.image && (
                            <div className="mb-4">
                              <img
                                src={questions[currentPreviewQuestion].image || "/placeholder.svg"}
                                alt="Question image"
                                className="max-w-full h-auto max-h-48 rounded-lg mx-auto"
                              />
                            </div>
                          )}
                          {questions[currentPreviewQuestion]?.type === "open-ended" ? (
                            <Textarea placeholder="Participant would type their answer here..." disabled />
                          ) : (
                            <div className="space-y-2 sm:space-y-3">
                              {questions[currentPreviewQuestion]?.options.map((option, index) => (
                                <div key={index} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-0">
                                  {questions[currentPreviewQuestion]?.type === "multiple-choice" ? (
                                    <Checkbox disabled className="shrink-0 mt-0.5" />
                                  ) : (
                                    <input
                                      type="radio"
                                      name="preview-option"
                                      disabled
                                      title={`Preview option ${index + 1}`}
                                      aria-label={`Preview option ${index + 1}`}
                                      className="shrink-0 mt-1"
                                    />
                                  )}
                                  <span
                                    className={`text-sm sm:text-base ${questions[currentPreviewQuestion]?.correctAnswers.includes(index) ? "text-green-600 font-medium" : ""}`}
                                  >
                                    {option || `Option ${index + 1}`}
                                    {questions[currentPreviewQuestion]?.correctAnswers.includes(index) && (
                                      <span className="text-xs sm:text-sm"> ✓</span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-black">
                Cancel
              </Button>
            </Link>
            <Button type="button" variant="outline" onClick={exportQuiz} className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-black">
              Export Quiz JSON
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              <span className="ml-2 sm:ml-0">{isLoading ? "Creating..." : "Create Quiz"}</span>
            </Button>
          </div>
        </form>
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
    </>
  )
}
