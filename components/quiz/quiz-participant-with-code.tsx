"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Trophy, Clock, Users } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import { WaitingRoomGame } from './waiting-room-game'

interface QuizParticipantWithCodeProps {
  sessionCode: string
  onClose: () => void
}

interface QuizInfo {
  title: string
  description: string
  totalQuestions: number
  timePerQuestion: number
}

interface Question {
  id: string
  question: string
  type: 'single-choice' | 'multiple-choice' | 'true-false'
  options?: string[]
  timeLimit?: number
}

interface CurrentQuestion {
  question: Question
  questionNumber: number
  totalQuestions: number
}

interface Participant {
  id: string
  name: string
  score: number
}

interface Poll {
  question: string
  options: string[]
}

export function QuizParticipantWithCode({ sessionCode, onClose }: QuizParticipantWithCodeProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [participantName, setParticipantName] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | number[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isQuizFinished, setIsQuizFinished] = useState(false)
  const [leaderboard, setLeaderboard] = useState<Participant[]>([])
  const [activePoll, setActivePoll] = useState<Poll | null>(null)
  const [pollResponse, setPollResponse] = useState('')
  const [hasPollResponded, setHasPollResponded] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    newSocket.on('joined-quiz', (data: { quizInfo: QuizInfo, participants: Participant[] }) => {
      console.log('Successfully joined quiz:', data)
      setHasJoined(true)
      setIsJoining(false)
      setQuizInfo(data.quizInfo)
      setParticipants(data.participants)
      setError('')
    })

    newSocket.on('join-error', (data: { message: string }) => {
      console.log('Join error:', data)
      setError(data.message)
      setIsJoining(false)
    })

    newSocket.on('quiz-started', () => {
      console.log('Quiz started')
    })

    newSocket.on('next-question', (data: CurrentQuestion) => {
      console.log('Next question:', data)
      setCurrentQuestion(data)
      setSelectedAnswer(data.question.type === 'multiple-choice' ? [] : 0)
      setTimeLeft(data.question.timeLimit || 30)
      setIsAnswered(false)
    })

    newSocket.on('answer-submitted', (data: { score: number, correct: boolean }) => {
      console.log('Answer result:', data)
      setScore(data.score)
    })

    newSocket.on('quiz-finished', (data: { leaderboard: Participant[] }) => {
      console.log('Quiz finished:', data)
      setIsQuizFinished(true)
      setLeaderboard(data.leaderboard)
      setCurrentQuestion(null)
    })

    newSocket.on('participant-joined', (data: { participant: Participant }) => {
      console.log('Participant joined:', data)
      setParticipants(prev => [...prev, data.participant])
    })

    newSocket.on('participant-left', (data: { participantId: string }) => {
      console.log('Participant left:', data)
      setParticipants(prev => prev.filter(p => p.id !== data.participantId))
    })

    newSocket.on('host-disconnected', () => {
      console.log('Host disconnected')
      setError('Host has disconnected. The quiz has ended.')
    })

    newSocket.on('poll-started', (data: Poll) => {
      console.log('Poll started:', data)
      setActivePoll(data)
      setPollResponse('')
      setHasPollResponded(false)
    })

    newSocket.on('poll-ended', () => {
      console.log('Poll ended')
      setActivePoll(null)
      setPollResponse('')
      setHasPollResponded(false)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0) return

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
  }, [currentQuestion, timeLeft])

  const joinQuiz = () => {
    if (!socket || !participantName.trim()) return
    
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
      currentScore: score
    })
    
    socket.emit('submit-answer', {
      sessionCode,
      questionId: currentQuestion.question.id,
      answer: selectedAnswer,
      timeSpent
    })
    
    setIsAnswered(true)
  }

  const handleAnswerChange = (value: string | boolean, optionIndex?: number) => {
    if (!currentQuestion || isAnswered) return

    if (currentQuestion.question.type === 'single-choice') {
      setSelectedAnswer(optionIndex!)
    } else if (currentQuestion.question.type === 'multiple-choice') {
      const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : []
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
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
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
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
                      participant.name === participantName ? 'bg-slate-700 border-2 border-slate-400 text-white' : 'bg-black dark:bg-gray-900 text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-600' : index === 2 ? 'bg-orange-400' : 'bg-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`font-medium ${
                        participant.name === participantName ? 'text-slate-200' : ''
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

  // Show name input form if not joined yet
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-black dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="font-sans">Enter Your Name</CardTitle>
            <CardDescription className="font-sans">
              Enter your name to join quiz with code: <span className="font-mono tracking-wider">{sessionCode}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-sans">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="participantName" className="font-sans">Your Name</Label>
              <Input
                id="participantName"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="font-sans"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && participantName.trim()) {
                    joinQuiz()
                  }
                }}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={joinQuiz} 
                disabled={!participantName.trim() || isJoining}
                className="flex-1 font-sans"
              >
                {isJoining ? 'Joining...' : 'Join Quiz'}
              </Button>
              <Button variant="outline" onClick={onClose} className="font-sans">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Rest of the component for when quiz is active (waiting room, questions, polls)
  if (activePoll) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Poll</CardTitle>
              <CardDescription>{activePoll.question}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activePoll.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={pollResponse === option ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setPollResponse(option)}
                    disabled={hasPollResponded}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {!hasPollResponded && (
                <Button 
                  onClick={submitPollResponse} 
                  disabled={!pollResponse}
                  className="w-full mt-4"
                >
                  Submit Response
                </Button>
              )}
              {hasPollResponded && (
                <div className="text-center mt-4 text-green-600">
                  Response submitted! Waiting for poll to end...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentQuestion) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">
                    Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
                  </CardTitle>
                  <CardDescription>Score: {score} points</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className={`font-bold ${
                    timeLeft <= 5 ? 'text-red-500' : timeLeft <= 10 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h2 className="text-lg font-medium">{currentQuestion.question.question}</h2>
                
                {currentQuestion.question.type === 'true-false' ? (
                  <div className="space-y-2">
                    <Button
                      variant={selectedAnswer === 0 ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleAnswerChange(true, 0)}
                      disabled={isAnswered}
                    >
                      True
                    </Button>
                    <Button
                      variant={selectedAnswer === 1 ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleAnswerChange(true, 1)}
                      disabled={isAnswered}
                    >
                      False
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentQuestion.question.options?.map((option, index) => (
                      <Button
                        key={index}
                        variant={
                          currentQuestion.question.type === 'single-choice'
                            ? selectedAnswer === index ? "default" : "outline"
                            : (Array.isArray(selectedAnswer) && selectedAnswer.includes(index)) ? "default" : "outline"
                        }
                        className="w-full justify-start"
                        onClick={() => handleAnswerChange(true, index)}
                        disabled={isAnswered}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
                
                {!isAnswered && (
                  <Button 
                    onClick={submitAnswer} 
                    disabled={timeLeft === 0 || (
                      currentQuestion.question.type === 'multiple-choice' 
                        ? (!Array.isArray(selectedAnswer) || selectedAnswer.length === 0)
                        : selectedAnswer === undefined
                    )}
                    className="w-full"
                  >
                    Submit Answer
                  </Button>
                )}
                
                {isAnswered && (
                  <div className="text-center text-green-600">
                    Answer submitted! Waiting for next question...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Waiting room
  return (
    <WaitingRoomGame 
      participants={participants}
      participantName={participantName}
      quizInfo={quizInfo}
    />
  )
}