"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Celebration } from '@/components/ui/celebration'
import { Users, Clock, Trophy, AlertCircle } from 'lucide-react'
import { useSocket } from '@/lib/socket-context'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface QuizParticipantProps {
  onClose: () => void
}

interface QuizInfo {
  title: string
  description: string
  questionCount: number
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

interface LeaderboardEntry {
  id: string
  name: string
  score: number
}

export function QuizParticipant({ onClose }: QuizParticipantProps) {
  const { socket, isConnected } = useSocket()
  const [sessionCode, setSessionCode] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | number[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isQuizFinished, setIsQuizFinished] = useState(false)
  const [error, setError] = useState<string>('')
  const [participantCount, setParticipantCount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [activePoll, setActivePoll] = useState<{question: string, options: string[]} | null>(null)
  const [pollResponse, setPollResponse] = useState<string>('')
  const [hasPollResponded, setHasPollResponded] = useState(false)
  const [pollResults, setPollResults] = useState<{question: string, results: {[key: string]: number}} | null>(null)

  useEffect(() => {
    if (!socket || !isConnected) return

    // Listen for successful join
    socket.on('joined-quiz', (data) => {
      setHasJoined(true)
      setQuizInfo(data.quiz)
      setIsJoining(false)
      setError('')
    })

    // Listen for join errors
    socket.on('join-error', (data) => {
      setError(data.message)
      setIsJoining(false)
    })

    // Listen for quiz start
    socket.on('quiz-started', (data) => {
      setCurrentQuestion(data)
      setTimeLeft(data.question.timeLimit)
      setIsAnswered(false)
      setSelectedAnswer(data.question.type === 'multiple-choice' ? [] : 0)
    })

    // Listen for next question
    socket.on('next-question', (data) => {
      setCurrentQuestion(data)
      setTimeLeft(data.question.timeLimit)
      setIsAnswered(false)
      setSelectedAnswer(data.question.type === 'multiple-choice' ? [] : 0)
    })

    // Listen for answer submission result
    socket.on('answer-submitted', (data) => {
      console.log('Answer submitted result:', data)
      setScore(data.totalScore)
      setIsAnswered(true)
    })

    // Listen for quiz finish
    socket.on('quiz-finished', (data) => {
      setLeaderboard(data.leaderboard)
      setIsQuizFinished(true)
      setCurrentQuestion(null)
      setShowCelebration(true)
    })

    // Listen for participant updates
    socket.on('participant-joined', (data) => {
      setParticipantCount(data.totalParticipants)
    })

    socket.on('participant-left', (data) => {
      setParticipantCount(data.totalParticipants)
    })

    // Listen for host disconnect
    socket.on('host-disconnected', () => {
      setError('Host has disconnected. Quiz session ended.')
      setCurrentQuestion(null)
    })

    // Listen for poll events
    socket.on('poll-started', (data) => {
      setActivePoll(data)
      setPollResponse('')
      setHasPollResponded(false)
      setPollResults(null)
    })

    socket.on('poll-ended', (data) => {
      setPollResults(data)
      setActivePoll(null)
    })

    return () => {
      socket.off('joined-quiz')
      socket.off('join-error')
      socket.off('quiz-started')
      socket.off('next-question')
      socket.off('answer-submitted')
      socket.off('quiz-finished')
      socket.off('participant-joined')
      socket.off('participant-left')
      socket.off('host-disconnected')
      socket.off('poll-started')
      socket.off('poll-ended')
    }
  }, [socket, isConnected])

  // Timer effect
  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0 || isAnswered) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          if (!isAnswered) {
            submitAnswer()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestion, timeLeft, isAnswered])

  const joinQuiz = () => {
    if (!socket || !sessionCode.trim() || !participantName.trim()) return
    
    setIsJoining(true)
    setError('')
    socket.emit('join-quiz', {
      sessionCode: sessionCode.toUpperCase(),
      participantName: participantName.trim()
    })
  }

  const submitAnswer = () => {
    if (!socket || !currentQuestion || isAnswered) return

    const timeSpent = (currentQuestion.question.timeLimit || 30) - timeLeft
    
    console.log('Submitting answer:', {
      sessionCode,
      questionId: currentQuestion.question.id,
      answer: selectedAnswer,
      timeSpent,
      questionType: currentQuestion.question.type,
      // Remove correctAnswers since it's not part of the question type
    })
    
    socket.emit('submit-answer', {
      sessionCode,
      questionId: currentQuestion.question.id,
      answer: selectedAnswer,
      timeSpent
    })
  }

  const handleAnswerChange = (value: string | boolean, optionIndex?: number) => {
    if (!currentQuestion || isAnswered) return

    if (currentQuestion.question.type === 'single-choice') {
      setSelectedAnswer(optionIndex!)
    } else if (currentQuestion.question.type === 'multiple-choice') {
      const currentAnswers = selectedAnswer as number[]
      if (value) {
        setSelectedAnswer([...currentAnswers, optionIndex!])
      } else {
        setSelectedAnswer(currentAnswers.filter(i => i !== optionIndex))
      }
    }
  }

  const submitPollResponse = () => {
    if (!socket || !activePoll || !pollResponse || hasPollResponded) return
    
    socket.emit('poll-response', {
      sessionCode,
      option: pollResponse
    })
    
    setHasPollResponded(true)
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
    const myPosition = leaderboard.findIndex(p => p.name === participantName) + 1
    
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
              <CardDescription>
                You finished in position #{myPosition} with {score} points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Final Leaderboard</h3>
                {leaderboard.map((participant, index) => (
                  <div 
                    key={participant.id} 
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      participant.name === participantName ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`font-medium ${
                        participant.name === participantName ? 'text-indigo-700' : ''
                      }`}>
                        {participant.name}
                        {participant.name === participantName && ' (You)'}
                      </span>
                    </div>
                    <Badge variant={participant.name === participantName ? 'default' : 'secondary'}>
                      {participant.score} points
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <Button onClick={onClose}>Leave Quiz</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Quiz</CardTitle>
            <CardDescription>Enter the session code to join a live quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="sessionCode">Session Code</Label>
              <Input
                id="sessionCode"
                placeholder="Enter 6-digit code"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="participantName">Your Name</Label>
              <Input
                id="participantName"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={joinQuiz} 
                disabled={!sessionCode.trim() || !participantName.trim() || isJoining}
                className="flex-1"
              >
                {isJoining ? 'Joining...' : 'Join Quiz'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{quizInfo?.title}</CardTitle>
            <CardDescription>{quizInfo?.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Users className="h-5 w-5" />
              <span>{participantCount} participants</span>
            </div>
            <div className="text-sm text-gray-600">
              {quizInfo?.questionCount} questions
            </div>
            <div className="text-lg font-medium text-gray-900">
              Waiting for host to start the quiz...
            </div>
            <div className="flex justify-center">
              <Button variant="outline" onClick={onClose}>Leave</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
                </CardTitle>
                <CardDescription>Score: {score} points</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono text-lg ${
                  timeLeft <= 5 ? 'text-red-500' : timeLeft <= 10 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
            <Progress 
              value={(currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100} 
              className="w-full"
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-xl font-medium">{currentQuestion.question.text}</div>
              
              {currentQuestion.question.type === 'single-choice' ? (
                <RadioGroup 
                  value={selectedAnswer.toString()} 
                  onValueChange={(value) => handleAnswerChange(value, parseInt(value))}
                  disabled={isAnswered}
                >
                  {currentQuestion.question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        <div className="p-3 rounded-lg border hover:bg-gray-50">
                          <span className="font-medium text-gray-700">
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  {currentQuestion.question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`option-${index}`}
                        checked={(selectedAnswer as number[]).includes(index)}
                        onCheckedChange={(checked) => handleAnswerChange(checked, index)}
                        disabled={isAnswered}
                      />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        <div className="p-3 rounded-lg border hover:bg-gray-50">
                          <span className="font-medium text-gray-700">
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-gray-600">
                  {isAnswered ? 'Answer submitted!' : 'Select your answer(s)'}
                </div>
                <Button 
                  onClick={submitAnswer}
                  disabled={isAnswered || timeLeft === 0 || 
                    (currentQuestion.question.type === 'single-choice' && selectedAnswer === 0 && !currentQuestion.question.options[0]) ||
                    (currentQuestion.question.type === 'multiple-choice' && (selectedAnswer as number[]).length === 0)
                  }
                >
                  {isAnswered ? 'Submitted' : 'Submit Answer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Active Poll */}
        {activePoll && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Live Poll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{activePoll.question}</h3>
                
                {!hasPollResponded ? (
                  <div className="space-y-3">
                    <RadioGroup value={pollResponse} onValueChange={setPollResponse}>
                      {activePoll.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`poll-option-${index}`} />
                          <Label htmlFor={`poll-option-${index}`} className="flex-1 cursor-pointer">
                            <div className="p-3 rounded-lg border hover:bg-gray-50">
                              <span className="font-medium text-gray-700">{option}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    
                    <Button 
                      onClick={submitPollResponse}
                      disabled={!pollResponse}
                      className="w-full"
                    >
                      Submit Response
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-green-600 font-medium mb-2">✓ Response submitted!</div>
                    <div className="text-sm text-gray-600">Your response: {pollResponse}</div>
                    <div className="text-sm text-gray-500 mt-2">Waiting for poll results...</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Poll Results */}
        {pollResults && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Poll Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{pollResults.question}</h3>
                
                <div className="space-y-3">
                  {Object.entries(pollResults.results).map(([option, votes]) => {
                    const totalVotes = Object.values(pollResults.results).reduce((sum, count) => sum + count, 0)
                    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
                    
                    return (
                      <div key={option} className="space-y-2">
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
                  Total responses: {Object.values(pollResults.results).reduce((sum, count) => sum + count, 0)}
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setPollResults(null)}
                  className="w-full mt-4"
                >
                  Close Results
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Celebration 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      />
    </div>
  )
}