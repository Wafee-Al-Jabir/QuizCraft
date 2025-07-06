"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, ArrowLeft, Save } from "lucide-react"
import { updateQuiz } from "@/lib/quiz-actions"
import type { Quiz, QuizQuestion, User } from "@/lib/types"

interface QuizEditFormProps {
  quiz: Quiz
  user: User
}

export function QuizEditForm({ quiz, user }: QuizEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(quiz.title)
  const [description, setDescription] = useState(quiz.description)
  const [questions, setQuestions] = useState<QuizQuestion[]>(quiz.questions)
  const [quizSettings, setQuizSettings] = useState(quiz.settings)

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      type: "single-choice",
      question: "",
      options: ["", ""],
      correctAnswers: [0],
      settings: {
        points: 10, // Default points value
        showLeaderboardAfter: false,
        timeLimit: 0
      },
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q
        return {
          ...q,
          options: [...q.options, ""],
        }
      })
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
      })
    )
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      })
    )
  }

  const toggleCorrectAnswer = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q

        let newCorrectAnswers: number[]
        if (q.type === "single-choice") {
          newCorrectAnswers = [optionIndex]
        } else {
          // multiple-choice
          if (q.correctAnswers.includes(optionIndex)) {
            newCorrectAnswers = q.correctAnswers.filter((idx) => idx !== optionIndex)
          } else {
            newCorrectAnswers = [...q.correctAnswers, optionIndex]
          }
        }

        return { ...q, correctAnswers: newCorrectAnswers }
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (!title.trim()) {
        alert("Please enter a quiz title")
        return
      }

      if (questions.length === 0) {
        alert("Please add at least one question")
        return
      }

      // Validate questions
      for (const question of questions) {
        if (!question.question.trim()) {
          alert("Please fill in all question texts")
          return
        }

        if (question.options.some((opt) => !opt.trim())) {
          alert("Please fill in all answer options")
          return
        }

        if (question.correctAnswers.length === 0) {
          alert("Please select at least one correct answer for each question")
          return
        }
      }

      const updatedQuiz = await updateQuiz(quiz.id, {
        title: title.trim(),
        description: description.trim(),
        questions,
        settings: quizSettings,
      })

      if (updatedQuiz) {
        router.push("/dashboard")
      } else {
        alert("Failed to update quiz. Please try again.")
      }
    } catch (error) {
      console.error("Error updating quiz:", error)
      alert("An error occurred while updating the quiz")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Quiz</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Information</CardTitle>
            <CardDescription>Basic details about your quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiz Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
            <CardDescription>Configure how your quiz behaves</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showLeaderboard">Show Leaderboard</Label>
                <p className="text-sm text-gray-600">Display participant rankings after quiz completion</p>
              </div>
              <Switch
                id="showLeaderboard"
                checked={quizSettings.showLeaderboard}
                onCheckedChange={(checked) =>
                  setQuizSettings({ ...quizSettings, showLeaderboard: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="randomizeQuestions">Randomize Questions</Label>
                <p className="text-sm text-gray-600">Show questions in random order for each participant</p>
              </div>
              <Switch
                id="randomizeQuestions"
                checked={quizSettings.randomizeQuestions}
                onCheckedChange={(checked) =>
                  setQuizSettings({ ...quizSettings, randomizeQuestions: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="randomizeOptions">Randomize Answer Options</Label>
                <p className="text-sm text-gray-600">Show answer options in random order</p>
              </div>
              <Switch
                id="randomizeOptions"
                checked={quizSettings.randomizeOptions}
                onCheckedChange={(checked) =>
                  setQuizSettings({ ...quizSettings, randomizeOptions: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions ({questions.length})</CardTitle>
                <CardDescription>Add and configure your quiz questions</CardDescription>
              </div>
              <Button type="button" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, questionIndex) => (
              <Card key={question.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={question.type}
                        onValueChange={(value: "single-choice" | "multiple-choice") =>
                          updateQuestion(question.id, { type: value, correctAnswers: [0] })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-choice">Single Choice</SelectItem>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        </SelectContent>
                      </Select>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      placeholder="Enter your question"
                      rows={2}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Answer Options</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addOption(question.id)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <Checkbox
                            checked={question.correctAnswers.includes(optionIndex)}
                            onCheckedChange={() => toggleCorrectAnswer(question.id, optionIndex)}
                          />
                          <Input
                            value={option}
                            onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1"
                          />
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(question.id, optionIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {question.type === "single-choice"
                        ? "Check one correct answer"
                        : "Check all correct answers"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}