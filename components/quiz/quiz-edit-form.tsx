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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Trash2, Plus, ArrowLeft, Save, Clock, Eye, Settings, Download, Copy } from "lucide-react"
import { updateQuiz } from "@/lib/quiz-actions"
import type { Quiz, QuizQuestion, User, QuestionType } from "@/lib/types"

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
  const [tags, setTags] = useState<string[]>(quiz.tags || [])
  const [newTag, setNewTag] = useState("")
  const [showQuizSettings, setShowQuizSettings] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentPreviewQuestion, setCurrentPreviewQuestion] = useState(0)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportJson, setExportJson] = useState('')

  // Predefined tags for dropdown
  const predefinedTags = [
    "Science", "Math", "History", "Geography", "Literature", "Technology", 
    "Sports", "Entertainment", "Business", "Health", "Art", "Music",
    "Programming", "Education", "General Knowledge", "Fun", "Trivia"
  ]

  const handleExportQuiz = () => {
    const exportData = {
      title,
      description,
      questions: questions.map(q => ({
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswers: q.correctAnswers,
        settings: q.settings,
        ...(q.image && { image: q.image })
      })),
      settings: quizSettings,
      tags
    }
    
    const jsonString = JSON.stringify(exportData, null, 2)
    setExportJson(jsonString)
    setShowExportModal(true)
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()])
    }
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleAddNewTag = () => {
    if (newTag.trim()) {
      addTag(newTag)
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportJson)
      alert('JSON copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = exportJson
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        alert('JSON copied to clipboard!')
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
        alert('Copy failed. Please manually select and copy the text.')
      }
      document.body.removeChild(textArea)
    }
  }

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      type: "single-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswers: [0],
      settings: {
        points: 1000,
        showLeaderboardAfter: false,
        timeLimit: undefined
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

  const handleImageUpload = (questionId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      updateQuestion(questionId, "image", imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleImagePaste = (questionId: string, e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf("image") !== -1) {
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
        tags,
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" onClick={() => router.back()} size="sm" className="sm:size-default">
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Edit Quiz</h1>
        </div>
        <Button variant="outline" onClick={handleExportQuiz} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Quiz
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Quiz Information</CardTitle>
            <CardDescription className="text-sm">Basic details about your quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
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
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a new tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddNewTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddNewTag} variant="outline" size="sm">
                    Add
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        Select Tag
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {predefinedTags
                        .filter(tag => !tags.includes(tag))
                        .map((tag) => (
                          <DropdownMenuItem key={tag} onClick={() => addTag(tag)}>
                            {tag}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        className={`${getTagColor(tag)} text-white hover:opacity-80 cursor-pointer`}
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Click on a tag to remove it. Press Enter or click Add to add a new tag.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Settings */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Quiz Settings</CardTitle>
            <CardDescription className="text-sm">Configure how your quiz behaves</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex-1">
                <Label htmlFor="showLeaderboard" className="text-sm sm:text-base">Show Leaderboard</Label>
                <p className="text-xs sm:text-sm text-gray-600">Display participant rankings after quiz completion</p>
              </div>
              <Switch
                id="showLeaderboard"
                checked={quizSettings.showLeaderboard}
                onCheckedChange={(checked) =>
                  setQuizSettings({ ...quizSettings, showLeaderboard: checked })
                }
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex-1">
                <Label htmlFor="randomizeQuestions" className="text-sm sm:text-base">Randomize Questions</Label>
                <p className="text-xs sm:text-sm text-gray-600">Show questions in random order for each participant</p>
              </div>
              <Switch
                id="randomizeQuestions"
                checked={quizSettings.randomizeQuestions}
                onCheckedChange={(checked) =>
                  setQuizSettings({ ...quizSettings, randomizeQuestions: checked })
                }
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex-1">
                <Label htmlFor="randomizeOptions" className="text-sm sm:text-base">Randomize Answer Options</Label>
                <p className="text-xs sm:text-sm text-gray-600">Show answer options in random order</p>
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
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <CardTitle className="text-lg sm:text-xl">Questions ({questions.length})</CardTitle>
                <CardDescription className="text-sm">Add and configure your quiz questions</CardDescription>
              </div>
              <Button type="button" onClick={addQuestion} size="sm" className="sm:size-default w-full sm:w-auto">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="ml-2 sm:ml-0">Add Question</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {questions.map((question, questionIndex) => (
              <Card key={question.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                    <CardTitle className="text-base sm:text-lg">Question {questionIndex + 1}</CardTitle>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <Select
                        value={question.type}
                        onValueChange={(value) => handleQuestionTypeChange(question.id, value as QuestionType)}
                      >
                        <SelectTrigger className="w-full sm:w-40 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-choice">Single Choice</SelectItem>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                          <SelectItem value="poll">Poll</SelectItem>
                          <SelectItem value="open-ended">Open-ended</SelectItem>
                        </SelectContent>
                      </Select>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
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

                  {/* Question Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor={`points-${question.id}`} className="text-sm sm:text-base">Points</Label>
                      <Input
                        id={`points-${question.id}`}
                        type="number"
                        min="1"
                        value={question.settings.points}
                        onChange={(e) => updateQuestionSettings(question.id, "points", parseInt(e.target.value) || 10)}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`time-limit-${question.id}`} className="text-sm sm:text-base">Time Limit (seconds)</Label>
                      <Input
                        id={`time-limit-${question.id}`}
                        type="number"
                        min="5"
                        placeholder="No limit"
                        value={question.settings.timeLimit || ""}
                        onChange={(e) => updateQuestionSettings(question.id, "timeLimit", e.target.value ? parseInt(e.target.value) : undefined)}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id={`show-leaderboard-${question.id}`}
                        checked={question.settings.showLeaderboardAfter}
                        onCheckedChange={(checked) => updateQuestionSettings(question.id, "showLeaderboardAfter", checked)}
                      />
                      <Label htmlFor={`show-leaderboard-${question.id}`} className="text-xs sm:text-sm">Show leaderboard after</Label>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Question Image (Optional)</Label>
                    {question.image ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <img
                            src={question.image}
                            alt="Question image"
                            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-700"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/*'
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) handleImageUpload(question.id, file)
                              }
                              input.click()
                            }}
                          >
                            Change Image
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeImage(question.id)}
                          >
                            Remove Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-700 bg-black rounded-lg p-6 text-center cursor-pointer hover:border-gray-600 transition-colors"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) handleImageUpload(question.id, file)
                          }
                          input.click()
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const file = e.dataTransfer.files[0]
                          if (file && file.type.startsWith('image/')) {
                            handleImageUpload(question.id, file)
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <p className="text-gray-500 mb-2">Click to upload, drag and drop, or paste (Ctrl+V) an image</p>
                        <Button
                          type="button"
                          variant="outline"
                        >
                          Upload Image
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* Answer Options - Only show for choice-based questions */}
                  {(question.type === "single-choice" || question.type === "multiple-choice" || question.type === "true-false" || question.type === "poll") && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2 sm:gap-0">
                        <Label className="text-sm sm:text-base">Answer Options</Label>
                        {question.type !== "true-false" && (
                          <Button type="button" variant="outline" size="sm" onClick={() => addOption(question.id)} className="w-full sm:w-auto">
                            <Plus className="h-3 w-3 sm:mr-1" />
                            <span className="ml-1 sm:ml-0">Add Option</span>
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            {question.type !== "poll" && (
                              <Checkbox
                                checked={question.correctAnswers.includes(optionIndex)}
                                onCheckedChange={() => toggleCorrectAnswer(question.id, optionIndex)}
                                className="shrink-0"
                              />
                            )}
                            <Input
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1 text-sm sm:text-base"
                              readOnly={question.type === "true-false"}
                            />
                            {question.options.length > 2 && question.type !== "true-false" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(question.id, optionIndex)}
                                className="shrink-0"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {question.type !== "poll" && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {question.type === "single-choice" || question.type === "true-false"
                            ? "Check one correct answer"
                            : "Check all correct answers"}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Open-ended question note */}
                  {question.type === "open-ended" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        This is an open-ended question. Participants will be able to type their own answers.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={showQuizSettings} onOpenChange={setShowQuizSettings}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  <Settings className="mr-2 h-4 w-4" />
                  Quiz Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-gray-700">
                <DialogHeader>
                  <DialogTitle>Quiz Settings</DialogTitle>
                  <DialogDescription>
                    Configure additional settings for your quiz
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-leaderboard"
                      checked={quizSettings.showLeaderboard}
                      onCheckedChange={(checked) => setQuizSettings({ ...quizSettings, showLeaderboard: checked })}
                    />
                    <Label htmlFor="show-leaderboard">Show leaderboard at the end</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="randomize-questions"
                      checked={quizSettings.randomizeQuestions}
                      onCheckedChange={(checked) => setQuizSettings({ ...quizSettings, randomizeQuestions: checked })}
                    />
                    <Label htmlFor="randomize-questions">Randomize question order</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="randomize-options"
                      checked={quizSettings.randomizeOptions}
                      onCheckedChange={(checked) => setQuizSettings({ ...quizSettings, randomizeOptions: checked })}
                    />
                    <Label htmlFor="randomize-options">Randomize answer options</Label>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-gray-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Quiz Preview</DialogTitle>
                  <DialogDescription>
                    Preview how your quiz will look to participants
                  </DialogDescription>
                </DialogHeader>
                {questions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        Question {currentPreviewQuestion + 1} of {questions.length}
                      </span>
                      <div className="flex gap-2">
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
                          onClick={() => setCurrentPreviewQuestion(Math.min(questions.length - 1, currentPreviewQuestion + 1))}
                          disabled={currentPreviewQuestion === questions.length - 1}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                    <Card className="bg-gray-900 border-gray-700">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">{questions[currentPreviewQuestion].question}</h3>
                          {questions[currentPreviewQuestion].image && (
                            <img
                              src={questions[currentPreviewQuestion].image}
                              alt="Question image"
                              className="w-full max-w-md h-48 object-cover rounded-lg mx-auto"
                            />
                          )}
                          {questions[currentPreviewQuestion].type !== "open-ended" && (
                            <div className="space-y-2">
                              {questions[currentPreviewQuestion].options.map((option, index) => (
                                <div key={index} className="p-3 border border-gray-600 rounded-lg bg-gray-800">
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                          {questions[currentPreviewQuestion].type === "open-ended" && (
                            <Textarea
                              placeholder="Participants will type their answer here..."
                              disabled
                              className="bg-gray-800 border-gray-600"
                            />
                          )}
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Points: {questions[currentPreviewQuestion].settings.points}</span>
                            {questions[currentPreviewQuestion].settings.timeLimit && (
                              <span>Time: {questions[currentPreviewQuestion].settings.timeLimit}s</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Saving..." : "Save Changes"}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

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