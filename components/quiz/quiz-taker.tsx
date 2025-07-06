"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, ArrowLeft, CheckCircle, Timer, Trophy, Medal } from "lucide-react"
import type { Quiz, QuizParticipant } from "@/lib/types"
import { submitAnswer } from "@/lib/quiz-actions"

interface QuizTakerProps {
  quiz: Quiz
  participant?: QuizParticipant
}

export function QuizTaker({ quiz, participant }: QuizTakerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[][]>(new Array(quiz.questions.length).fill([]))
  const [textAnswers, setTextAnswers] = useState<string[]>(new Array(quiz.questions.length).fill(""))
  const [showResults, setShowResults] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [participantName, setParticipantName] = useState("")
  const [participantId, setParticipantId] = useState("")
  const [isNameEntered, setIsNameEntered] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<QuizParticipant[]>([])
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())

  // Initialize with randomized questions if needed
  const [quizQuestions, setQuizQuestions] = useState(() => {
    if (quiz.settings.randomizeQuestions) {
      return [...quiz.questions].sort(() => Math.random() - 0.5)
    }
    return quiz.questions
  })

  useEffect(() => {
    if (participant) {
      setParticipantId(participant.id)
      setParticipantName(participant.name)
      setIsNameEntered(true)
    }
  }, [participant])

  useEffect(() => {
    // Set timer for current question if it has a time limit
    const question = quizQuestions[currentQuestion]
    if (question?.settings?.timeLimit) {
      setTimeLeft(question.settings.timeLimit)
      setQuestionStartTime(Date.now())

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            // Auto-submit when time is up
            if (prev === 1) {
              handleSubmitAnswer()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } else {
      setTimeLeft(null)
    }
  }, [currentQuestion, quizQuestions])

  const handleAnswerChange = (questionType: string, value: any) => {
    if (questionType === "single-choice") {
      const answerIndex = Number.parseInt(value)
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = [answerIndex]
      setAnswers(newAnswers)
    } else if (questionType === "multiple-choice") {
      const answerIndex = Number.parseInt(value)
      const newAnswers = [...answers]
      const currentAnswers = newAnswers[currentQuestion] || []

      if (currentAnswers.includes(answerIndex)) {
        newAnswers[currentQuestion] = currentAnswers.filter((idx) => idx !== answerIndex)
      } else {
        newAnswers[currentQuestion] = [...currentAnswers, answerIndex]
      }

      setAnswers(newAnswers)
    } else if (questionType === "open-ended") {
      const newTextAnswers = [...textAnswers]
      newTextAnswers[currentQuestion] = value
      setTextAnswers(newTextAnswers)
    }
  }

  const handleSubmitAnswer = async () => {
    const question = quizQuestions[currentQuestion]
    const timeToAnswer = Math.round((Date.now() - questionStartTime) / 1000)

    let isCorrect = false
    let pointsEarned = 0

    // Calculate if answer is correct and points earned
    if (question.type !== "open-ended" && question.type !== "poll") {
      const selectedOptions = answers[currentQuestion] || []

      if (question.type === "single-choice" || question.type === "true-false") {
        isCorrect = selectedOptions.length === 1 && question.correctAnswers.includes(selectedOptions[0])
      } else if (question.type === "multiple-choice") {
        // For multiple choice, all correct options must be selected and no incorrect ones
        const allCorrectSelected = question.correctAnswers.every((idx) => selectedOptions.includes(idx))
        const noIncorrectSelected = selectedOptions.every((idx) => question.correctAnswers.includes(idx))
        isCorrect = allCorrectSelected && noIncorrectSelected
      }

      // Calculate points based on correctness and time
      if (isCorrect) {
        pointsEarned = question.settings.points

        // Bonus points for fast answers if there's a time limit
        if (question.settings.timeLimit && timeToAnswer < question.settings.timeLimit) {
          const timeBonus = Math.floor((1 - timeToAnswer / question.settings.timeLimit) * 5)
          pointsEarned += timeBonus
        }
      }
    }

    // Submit answer to server
    if (participantId) {
      await submitAnswer({
        quizId: quiz.id,
        participantId,
        questionId: question.id,
        selectedOptions: answers[currentQuestion] || [],
        textAnswer: textAnswers[currentQuestion] || "",
        timeToAnswer,
        isCorrect,
        pointsEarned,
      })
    }

    // Show leaderboard if configured for this question
    if (question.settings.showLeaderboardAfter) {
      // Fetch updated leaderboard data
      const updatedLeaderboard = await fetchLeaderboard(quiz.id)
      setLeaderboardData(updatedLeaderboard)
      setShowLeaderboard(true)
    } else {
      moveToNextQuestion()
    }
  }

  const moveToNextQuestion = () => {
    if (showLeaderboard) {
      setShowLeaderboard(false)
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setQuestionStartTime(Date.now())
    } else {
      finishQuiz()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const finishQuiz = async () => {
    // Fetch final leaderboard
    const finalLeaderboard = await fetchLeaderboard(quiz.id)
    setLeaderboardData(finalLeaderboard)
    setShowResults(true)
  }

  const fetchLeaderboard = async (quizId: string) => {
    // In a real app, this would be an API call
    // For now, we'll just sort the participants by score
    return [...(quiz.participants || [])].sort((a, b) => b.score - a.score)
  }

  const calculateScore = () => {
    let correct = 0
    let totalPoints = 0

    quizQuestions.forEach((question, index) => {
      if (question.type !== "open-ended" && question.type !== "poll") {
        const selectedOptions = answers[index] || []

        if (question.type === "single-choice" || question.type === "true-false") {
          if (selectedOptions.length === 1 && question.correctAnswers.includes(selectedOptions[0])) {
            correct++
            totalPoints += question.settings.points
          }
        } else if (question.type === "multiple-choice") {
          const allCorrectSelected = question.correctAnswers.every((idx) => selectedOptions.includes(idx))
          const noIncorrectSelected = selectedOptions.every((idx) => question.correctAnswers.includes(idx))

          if (allCorrectSelected && noIncorrectSelected) {
            correct++
            totalPoints += question.settings.points
          }
        }
      }
    })

    return { correct, totalPoints }
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (participantName.trim()) {
      setIsNameEntered(true)
      // In a real app, this would create a participant in the database
      setParticipantId(Date.now().toString())
    }
  }

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  // Name entry screen
  if (!isNameEntered) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{quiz.title}</CardTitle>
            <CardDescription className="text-center">Enter your name to begin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Start Quiz
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results screen
  if (showResults) {
    const { correct, totalPoints } = calculateScore()
    const percentage = Math.round((correct / quizQuestions.length) * 100)

    return (
      <>
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 transition-colors duration-300">
          <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Quiz Results</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
              <CardDescription>{quiz.title}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {correct}/{quizQuestions.length}
                </div>
                <div className="text-lg text-gray-600">{percentage}% Correct</div>
                <div className="text-xl font-semibold text-indigo-600 mt-2">{totalPoints} Points</div>
              </div>

              {quiz.settings.showLeaderboard && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center justify-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Leaderboard
                  </h3>
                  <div className="space-y-2">
                    {leaderboardData.slice(0, 10).map((participant, index) => (
                      <div
                        key={participant.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          participant.id === participantId ? "bg-indigo-100 border border-indigo-300" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="w-8 text-center font-bold">
                            {index === 0 && <Medal className="h-5 w-5 text-yellow-500 inline" />}
                            {index === 1 && <Medal className="h-5 w-5 text-gray-400 inline" />}
                            {index === 2 && <Medal className="h-5 w-5 text-amber-700 inline" />}
                            {index > 2 && `${index + 1}.`}
                          </span>
                          <span className="font-medium ml-2">{participant.name}</span>
                          {participant.id === participantId && (
                            <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                        <span className="font-bold">{participant.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">Review Your Answers</h3>
                {quizQuestions.map((question, index) => (
                  <div key={question.id} className="text-left p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium mb-2">
                      {index + 1}. {question.question}
                    </div>
                    {question.type === "open-ended" ? (
                      <div className="text-sm">
                        <div className="font-medium">Your answer:</div>
                        <div className="p-2 bg-white border rounded mt-1">{textAnswers[index] || "Not answered"}</div>
                      </div>
                    ) : question.type === "poll" ? (
                      <div className="text-sm">
                        <div className="font-medium">Your choice:</div>
                        <div>{answers[index]?.map((idx) => question.options[idx]).join(", ") || "Not answered"}</div>
                      </div>
                    ) : (
                      <div className="text-sm space-y-1">
                        <div
                          className={`${
                            question.type === "single-choice" || question.type === "true-false"
                              ? answers[index]?.length === 1 && question.correctAnswers.includes(answers[index][0])
                                ? "text-green-600"
                                : "text-red-600"
                              : "text-gray-700"
                          }`}
                        >
                          Your answer:{" "}
                          {answers[index]?.map((idx) => question.options[idx]).join(", ") || "Not answered"}
                        </div>
                        {(question.type === "single-choice" ||
                          question.type === "true-false" ||
                          question.type === "multiple-choice") &&
                          !(
                            question.type === "single-choice" &&
                            answers[index]?.length === 1 &&
                            question.correctAnswers.includes(answers[index][0])
                          ) && (
                            <div className="text-green-600">
                              Correct answer: {question.correctAnswers.map((idx) => question.options[idx]).join(", ")}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center space-x-4">
                <Link href="/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // Leaderboard screen between questions
  if (showLeaderboard) {
    return (
      <>
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <CardTitle>Current Standings</CardTitle>
              <CardDescription>
                Question {currentQuestion + 1} of {quizQuestions.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaderboardData.slice(0, 10).map((participant, index) => (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    participant.id === participantId
                      ? "bg-indigo-100 border border-indigo-300"
                      : index % 2 === 0
                        ? "bg-gray-50"
                        : "bg-white"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="w-8 text-center font-bold">
                      {index === 0 && <Medal className="h-5 w-5 text-yellow-500 inline" />}
                      {index === 1 && <Medal className="h-5 w-5 text-gray-400 inline" />}
                      {index === 2 && <Medal className="h-5 w-5 text-amber-700 inline" />}
                      {index > 2 && `${index + 1}.`}
                    </span>
                    <span className="font-medium ml-2">{participant.name}</span>
                    {participant.id === participantId && (
                      <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">You</span>
                    )}
                  </div>
                  <span className="font-bold">{participant.score} pts</span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={moveToNextQuestion}>
                {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "See Final Results"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </>
    )
  }

  // Quiz taking screen
  const question = quizQuestions[currentQuestion]
  const isAnswered =
    question.type === "open-ended"
      ? textAnswers[currentQuestion]?.trim().length > 0
      : answers[currentQuestion]?.length > 0

  return (
    <>
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Quiz
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
          </div>
          {timeLeft !== null && (
            <div className="ml-auto flex items-center space-x-2">
              <Timer className={`h-5 w-5 ${timeLeft < 5 ? "text-red-500" : "text-gray-500"}`} />
              <span className={`font-mono font-bold ${timeLeft < 5 ? "text-red-500" : "text-gray-700"}`}>
                {timeLeft}s
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{question.question}</CardTitle>
            {question.type === "poll" && <CardDescription>Poll question - choose your answer</CardDescription>}
            {question.type === "multiple-choice" && <CardDescription>Select all correct answers</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            {question.type === "single-choice" || question.type === "true-false" ? (
              <RadioGroup
                value={answers[currentQuestion]?.[0]?.toString() || ""}
                onValueChange={(value) => handleAnswerChange("single-choice", value)}
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : question.type === "multiple-choice" || question.type === "poll" ? (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`option-${index}`}
                      checked={(answers[currentQuestion] || []).includes(index)}
                      onCheckedChange={() => handleAnswerChange("multiple-choice", index)}
                    />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="open-answer">Your Answer</Label>
                <Textarea
                  id="open-answer"
                  value={textAnswers[currentQuestion] || ""}
                  onChange={(e) => handleAnswerChange("open-ended", e.target.value)}
                  placeholder="Type your answer here..."
                  rows={5}
                />
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
                Previous
              </Button>

              <Button onClick={handleSubmitAnswer} disabled={!isAnswered}>
                {currentQuestion === quizQuestions.length - 1 ? "Finish Quiz" : "Submit Answer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
