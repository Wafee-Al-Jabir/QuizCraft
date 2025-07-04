"use client"

import type React from "react"

import { useState } from "react"
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
import { BookOpen, Plus, Trash2, ArrowLeft, Settings, Clock } from "lucide-react"
import { createQuiz } from "@/lib/quiz-actions"
import type { User, QuizQuestion, QuestionType } from "@/lib/types"

interface QuizCreateFormProps {
  user: User
}

export function QuizCreateForm({ user }: QuizCreateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [showQuizSettings, setShowQuizSettings] = useState(false)
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
        points: 10,
        showLeaderboardAfter: false,
      },
    },
  ])

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswers: [0],
      type: "single-choice",
      settings: {
        points: 10,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const quiz = await createQuiz({
        title,
        description,
        questions,
        userId: user.id,
        settings: quizSettings,
      })
      router.push(`/quiz/${quiz.id}/edit`)
    } catch (error) {
      console.error("Failed to create quiz:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Create New Quiz</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quiz Details</CardTitle>
                  <CardDescription>Basic information about your quiz</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuizSettings(!showQuizSettings)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Quiz Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <div className="mt-4 p-4 border rounded-md bg-gray-50">
                  <h3 className="text-sm font-medium mb-3">Quiz Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="showLeaderboard">Show Leaderboard</Label>
                        <p className="text-sm text-gray-500">Display rankings after quiz completion</p>
                      </div>
                      <Switch
                        id="showLeaderboard"
                        checked={quizSettings.showLeaderboard}
                        onCheckedChange={(checked) => setQuizSettings({ ...quizSettings, showLeaderboard: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="randomizeQuestions">Randomize Questions</Label>
                        <p className="text-sm text-gray-500">Show questions in random order</p>
                      </div>
                      <Switch
                        id="randomizeQuestions"
                        checked={quizSettings.randomizeQuestions}
                        onCheckedChange={(checked) => setQuizSettings({ ...quizSettings, randomizeQuestions: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="randomizeOptions">Randomize Options</Label>
                        <p className="text-sm text-gray-500">Show answer options in random order</p>
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

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button type="button" onClick={addQuestion} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, questionIndex) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Question {questionIndex + 1}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {questions.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                      placeholder="Enter your question"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-type-${question.id}`}>Question Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => handleQuestionTypeChange(question.id, value as QuestionType)}
                      >
                        <SelectTrigger id={`question-type-${question.id}`}>
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
                      <Label htmlFor={`question-points-${question.id}`}>Points</Label>
                      <Input
                        id={`question-points-${question.id}`}
                        type="number"
                        min="0"
                        value={question.settings.points}
                        onChange={(e) =>
                          updateQuestionSettings(question.id, "points", Number.parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`show-leaderboard-${question.id}`}
                      checked={question.settings.showLeaderboardAfter}
                      onCheckedChange={(checked) =>
                        updateQuestionSettings(question.id, "showLeaderboardAfter", !!checked)
                      }
                    />
                    <Label htmlFor={`show-leaderboard-${question.id}`} className="text-sm">
                      Show leaderboard after this question
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Time Limit (Optional)</Label>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          placeholder="Seconds"
                          className="w-24"
                          value={question.settings.timeLimit || ""}
                          onChange={(e) =>
                            updateQuestionSettings(
                              question.id,
                              "timeLimit",
                              e.target.value ? Number.parseInt(e.target.value) : undefined,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {question.type !== "open-ended" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Answer Options</Label>
                        {question.type !== "true-false" && (
                          <div className="flex space-x-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => addOption(question.id)}>
                              <Plus className="h-3 w-3 mr-1" /> Add Option
                            </Button>
                          </div>
                        )}
                      </div>

                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          {question.type !== "poll" &&
                            (question.type === "multiple-choice" ? (
                              <Checkbox
                                checked={question.correctAnswers.includes(optionIndex)}
                                onCheckedChange={() => toggleCorrectAnswer(question.id, optionIndex)}
                                className="text-indigo-600"
                              />
                            ) : (
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={question.correctAnswers.includes(optionIndex)}
                                onChange={() => toggleCorrectAnswer(question.id, optionIndex)}
                                className="text-indigo-600"
                              />
                            ))}
                          <div className="flex-1 flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              required={question.type !== "open-ended"}
                            />
                            {question.options.length > 2 && question.type !== "true-false" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(question.id, optionIndex)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          {question.type !== "poll" && (
                            <span className="text-sm text-gray-500 min-w-fit">
                              {question.correctAnswers.includes(optionIndex) ? "(Correct)" : ""}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "open-ended" && (
                    <div className="p-4 border rounded-md bg-gray-50">
                      <p className="text-sm text-gray-600">
                        Open-ended questions allow participants to enter free-form text responses. These responses will
                        be collected but not automatically scored.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
