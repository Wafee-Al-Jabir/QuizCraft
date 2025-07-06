"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Play, SkipForward, Trophy, Clock, CheckCircle, BarChart3, MessageSquare } from 'lucide-react'
import { useSocket } from '@/lib/socket-context'
import type { Quiz } from '@/lib/types'

interface QuizHostProps {
  quiz: Quiz
  onClose: () => void
}

interface Participant {
  id: string
  name: string
  score: number
}

interface QuizSession {
  id: string
  quizId: string
  hostId: string
  participants: Map<string, Participant>
  currentQuestion: number
  isActive: boolean
}

interface QuestionData {
  questionNumber: number
  totalQuestions: number
  question: {
    id: string
    text: string
    type: string
    options: string[]
    timeLimit: number
  }
}

export function QuizHost({ quiz, onClose }: QuizHostProps) {
  const { socket, isConnected } = useSocket()
  const [sessionCode, setSessionCode] = useState<string>('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null)
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [isWaitingRoom, setIsWaitingRoom] = useState(true)
  const [leaderboard, setLeaderboard] = useState<Participant[]>([])
  const [isQuizFinished, setIsQuizFinished] = useState(false)
  const [answeredParticipants, setAnsweredParticipants] = useState<Set<string>>(new Set())
  const [showInterlude, setShowInterlude] = useState(false)
  const [interludeType, setInterludeType] = useState<'leaderboard' | 'poll'>('leaderboard')
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [pollResults, setPollResults] = useState<{[key: string]: number}>({})
  const [activePoll, setActivePoll] = useState<{question: string, options: string[]} | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!socket || !isConnected) return

    // Host the quiz when component mounts
    socket.emit('host-quiz', {
      quizId: quiz.id,
      hostId: 'host', // In a real app, this would be the actual host ID
      quiz: quiz
    })

    // Listen for quiz hosted confirmation
    socket.on('quiz-hosted', (data) => {
      setSessionCode(data.sessionCode)
      console.log('Quiz hosted with code:', data.sessionCode)
    })

    // Listen for participants joining
    socket.on('participant-joined', (data) => {
      setParticipants(prev => {
        const existing = prev.find(p => p.id === data.participant.id)
        if (existing) return prev
        return [...prev, data.participant]
      })
    })

    // Listen for participants leaving
    socket.on('participant-left', (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.participantId))
    })

    // Listen for participant answers
    socket.on('participant-answered', (data) => {
      setAnsweredParticipants(prev => new Set([...prev, data.participantId]))
      setParticipants(prev => 
        prev.map(p => 
          p.id === data.participantId 
            ? { ...p, score: data.totalScore }
            : p
        )
      )
    })

    // Listen for quiz finished
    socket.on('quiz-finished', (data) => {
      setLeaderboard(data.leaderboard)
      setIsQuizFinished(true)
      setIsQuizActive(false)
    })

    // Listen for poll responses
    socket.on('poll-response', (data) => {
      setPollResults(prev => ({
        ...prev,
        [data.option]: (prev[data.option] || 0) + 1
      }))
    })

    return () => {
      socket.off('quiz-hosted')
      socket.off('participant-joined')
      socket.off('participant-left')
      socket.off('participant-answered')
      socket.off('quiz-finished')
      socket.off('poll-response')
    }
  }, [socket, isConnected, quiz])

  // Timer effect for host
  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0 || !isQuizActive) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestion, timeLeft, isQuizActive])

  const startQuiz = () => {
    if (!socket || participants.length === 0) return
    
    socket.emit('start-quiz', { sessionCode })
    setIsQuizActive(true)
    setIsWaitingRoom(false)
    const firstQuestion = {
      questionNumber: 1,
      totalQuestions: quiz.questions.length,
      question: {
        id: quiz.questions[0].id,
        text: quiz.questions[0].question,
        type: quiz.questions[0].type,
        options: quiz.questions[0].options,
        timeLimit: quiz.questions[0].settings?.timeLimit || 30
      }
    }
    setCurrentQuestion(firstQuestion)
    setTimeLeft(firstQuestion.question.timeLimit)
    setAnsweredParticipants(new Set())
  }

  const nextQuestion = () => {
    if (!socket) return
    
    socket.emit('next-question', { sessionCode })
    setAnsweredParticipants(new Set())
    
    const nextQuestionIndex = currentQuestion ? currentQuestion.questionNumber : 0
    if (nextQuestionIndex < quiz.questions.length) {
      const nextQ = quiz.questions[nextQuestionIndex]
      const nextQuestionData = {
        questionNumber: nextQuestionIndex + 1,
        totalQuestions: quiz.questions.length,
        question: {
          id: nextQ.id,
          text: nextQ.question,
          type: nextQ.type,
          options: nextQ.options,
          timeLimit: nextQ.settings?.timeLimit || 30
        }
      }
      setCurrentQuestion(nextQuestionData)
      setTimeLeft(nextQuestionData.question.timeLimit)
    }
  }

  const showLeaderboard = () => {
    setInterludeType('leaderboard')
    setShowInterlude(true)
  }

  const showPoll = () => {
    if (pollQuestion.trim() && pollOptions.every(opt => opt.trim())) {
      setActivePoll({ question: pollQuestion, options: pollOptions })
      setInterludeType('poll')
      setShowInterlude(true)
      setPollResults({})
      
      // Emit poll to participants
      if (socket) {
        socket.emit('start-poll', {
          sessionCode,
          poll: { question: pollQuestion, options: pollOptions }
        })
      }
    }
  }

  const closePoll = () => {
    setShowInterlude(false)
    setActivePoll(null)
    if (socket) {
      socket.emit('end-poll', { sessionCode })
    }
  }

  const closeLeaderboard = () => {
    setShowInterlude(false)
  }

  const addPollOption = () => {
    setPollOptions([...pollOptions, ''])
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index))
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-lg font-medium text-gray-900 mb-2">Connecting...</div>
            <div className="text-sm text-gray-600">Please wait while we establish connection</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isQuizFinished) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
              <CardDescription>Final Results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Final Leaderboard</h3>
                {leaderboard.map((participant, index) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{participant.name}</span>
                    </div>
                    <Badge variant="secondary">{participant.score} points</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <Button onClick={onClose}>Close Host Session</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            {sessionCode && (
              <div className="text-center">
                <div className="text-sm text-gray-600">Session Code</div>
                <div className="text-2xl font-bold text-indigo-600">{sessionCode}</div>
              </div>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isWaitingRoom ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Waiting Room
                  </CardTitle>
                  <CardDescription>
                    Share the session code with participants to join
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-6xl font-bold text-indigo-600 mb-4">{sessionCode}</div>
                    <p className="text-gray-600 mb-6">Participants can join using this code</p>
                    <Button 
                      onClick={startQuiz} 
                      disabled={participants.length === 0}
                      className="px-8 py-3"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz ({participants.length} participants)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : currentQuestion ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
                    </CardTitle>
                    <Badge variant={timeLeft <= 10 ? "destructive" : "outline"}>
                      <Clock className="h-3 w-3 mr-1" />
                      {timeLeft}s
                    </Badge>
                  </div>
                  <Progress 
                    value={(currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100} 
                    className="w-full"
                  />
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-xl font-medium">{currentQuestion.question.text}</div>
                    
                    <div className="grid gap-3">
                      {currentQuestion.question.options.map((option, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                          <span className="font-medium text-gray-700">
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-600">
                          {answeredParticipants.size} of {participants.length} answered
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" onClick={showLeaderboard}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Show Leaderboard
                        </Button>
                        <Button variant="outline" onClick={() => setInterludeType('poll')} disabled={!pollQuestion.trim() || !pollOptions.every(opt => opt.trim())}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Start Poll
                        </Button>
                        <Button onClick={nextQuestion}>
                          <SkipForward className="h-4 w-4 mr-2" />
                          {currentQuestion.questionNumber === currentQuestion.totalQuestions ? 'Finish Quiz' : 'Next Question'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
            
            {/* Poll/Leaderboard Interlude */}
            {showInterlude && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      {interludeType === 'leaderboard' ? (
                        <><BarChart3 className="h-5 w-5 mr-2" />Current Leaderboard</>
                      ) : (
                        <><MessageSquare className="h-5 w-5 mr-2" />Live Poll</>
                      )}
                    </span>
                    <Button variant="outline" onClick={interludeType === 'leaderboard' ? closeLeaderboard : closePoll}>
                      Close
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {interludeType === 'leaderboard' ? (
                    <div className="space-y-3">
                      {participants
                        .sort((a, b) => b.score - a.score)
                        .map((participant, index) => (
                          <div key={participant.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="font-semibold text-lg">{participant.name}</span>
                            </div>
                            <Badge variant="secondary" className="text-lg px-3 py-1">
                              {participant.score} points
                            </Badge>
                          </div>
                        ))
                      }
                    </div>
                  ) : activePoll ? (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">{activePoll.question}</h3>
                      <div className="space-y-3">
                        {activePoll.options.map((option, index) => {
                          const votes = pollResults[option] || 0
                          const totalVotes = Object.values(pollResults).reduce((sum, count) => sum + count, 0)
                          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
                          
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{option}</span>
                                <span className="text-sm text-gray-600">{votes} votes ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="text-center text-sm text-gray-600 mt-4">
                        Total responses: {Object.values(pollResults).reduce((sum, count) => sum + count, 0)}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Participants Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {participants.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No participants yet
                    </div>
                  ) : (
                    participants
                      .sort((a, b) => b.score - a.score)
                      .map((participant, index) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <span className="font-medium text-sm">{participant.name}</span>
                            {answeredParticipants.has(participant.id) && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {participant.score}
                          </Badge>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Poll Creation Form */}
            {!isWaitingRoom && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Create Poll
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="poll-question">Poll Question</Label>
                      <Input
                        id="poll-question"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        placeholder="Enter your poll question..."
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Poll Options</Label>
                      <div className="space-y-2 mt-1">
                        {pollOptions.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1"
                            />
                            {pollOptions.length > 2 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removePollOption(index)}
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addPollOption}
                          disabled={pollOptions.length >= 6}
                        >
                          Add Option
                        </Button>
                        <Button
                          size="sm"
                          onClick={showPoll}
                          disabled={!pollQuestion.trim() || !pollOptions.every(opt => opt.trim())}
                        >
                          Start Poll
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}