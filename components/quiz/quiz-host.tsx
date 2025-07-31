"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Play, SkipForward, Trophy, Clock, CheckCircle, BarChart3, MessageSquare, QrCode, Copy, Crown } from 'lucide-react'
import { useSocket } from '@/lib/socket-context'
import { saveLiveSessionParticipants } from '@/lib/quiz-actions'
import { SimpleThemeToggle } from '@/components/ui/theme-toggle'
import QRCode from 'qrcode'
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
    image?: string
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showFullscreenLeaderboard, setShowFullscreenLeaderboard] = useState(false)
  const [leaderboardCountdown, setLeaderboardCountdown] = useState(0)

  useEffect(() => {
    if (!socket || !isConnected) return

    console.log('Attempting to host quiz:', quiz.title)
    
    // Host the quiz when component mounts
    socket.emit('host-quiz', {
      quizId: quiz.id,
      hostId: 'host', // In a real app, this would be the actual host ID
      quiz: quiz
    })
    
    // Add error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    // Listen for quiz hosted confirmation
    socket.on('quiz-hosted', async (data) => {
      setSessionCode(data.sessionCode)
      console.log('Quiz hosted with code:', data.sessionCode)
      
      // Generate QR code for the session
      try {
        const joinUrl = `https://quizcraft-knjk.onrender.com/quiz/join/${data.sessionCode}`
        const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeUrl(qrCodeDataUrl)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
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
    socket.on('quiz-finished', async (data) => {
      setLeaderboard(data.leaderboard)
      setIsQuizFinished(true)
      setIsQuizActive(false)
      
      // Save participants to database for badge tracking
      if (participants.length > 0) {
        try {
          await saveLiveSessionParticipants(quiz.id, participants)
          console.log('Live session participants saved to database')
        } catch (error) {
          console.error('Failed to save live session participants:', error)
        }
      }
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
      socket.off('error')
      socket.off('connect_error')
    }
  }, [socket, isConnected, quiz])

  // Timer effect for host - continues running even after participants answer
  useEffect(() => {
    if (!currentQuestion || !isQuizActive || showFullscreenLeaderboard) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Check if current question has showLeaderboardAfter enabled
          const currentQuestionIndex = currentQuestion.questionNumber - 1
          const questionSettings = quiz.questions[currentQuestionIndex]?.settings
          if (questionSettings?.showLeaderboardAfter && socket) {
            // Emit show-question-results event when timer reaches 0
            socket.emit('show-question-results', { 
              sessionCode, 
              questionIndex: currentQuestionIndex 
            })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestion, isQuizActive, showFullscreenLeaderboard, socket, sessionCode, quiz.questions])

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
        timeLimit: quiz.questions[0].settings?.timeLimit || 30,
        image: quiz.questions[0].image
      }
    }
    setCurrentQuestion(firstQuestion)
    setTimeLeft(firstQuestion.question.timeLimit)
    setAnsweredParticipants(new Set())
  }

  const nextQuestion = () => {
    if (!socket) return
    
    // Check if current question has showLeaderboardAfter enabled before moving to next
    if (currentQuestion) {
      const currentQuestionIndex = currentQuestion.questionNumber - 1
      const questionSettings = quiz.questions[currentQuestionIndex]?.settings
      if (questionSettings?.showLeaderboardAfter) {
        // Emit show-question-results event before advancing
        socket.emit('show-question-results', { 
          sessionCode, 
          questionIndex: currentQuestionIndex 
        })
      }
    }
    
    // Show fullscreen leaderboard for 5 seconds before next question
    setShowFullscreenLeaderboard(true)
    setLeaderboardCountdown(5)
    
    // Start countdown timer
    const countdownInterval = setInterval(() => {
      setLeaderboardCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setShowFullscreenLeaderboard(false)
          
          // Now proceed with next question
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
                timeLimit: nextQ.settings?.timeLimit || 30,
                image: nextQ.image
              }
            }
            setCurrentQuestion(nextQuestionData)
            setTimeLeft(nextQuestionData.question.timeLimit)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
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
      <div className="min-h-screen bg-black dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300 font-['Poppins']">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="text-center py-6 sm:py-8">
            <div className="text-base sm:text-lg font-medium text-gray-900 mb-2">Connecting...</div>
            <div className="text-sm text-gray-600">Please wait while we establish connection</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isQuizFinished) {
    return (
      <div className="min-h-screen bg-black dark:bg-gray-900 p-3 sm:p-4 transition-colors duration-300 font-['Poppins']">
        <div className="max-w-4xl mx-auto">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Quiz Completed!</CardTitle>
              <CardDescription>Final Results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Final Leaderboard</h3>
                {leaderboard.map((participant, index) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-gray-600">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-600' : index === 2 ? 'bg-orange-400' : 'bg-gray-700'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="font-semibold text-sm sm:text-lg text-white">{participant.name}</span>
                            </div>
                            <Badge variant="secondary" className="text-sm sm:text-lg px-2 sm:px-3 py-1">{participant.score} points</Badge>
                          </div>
                ))}
              </div>
              <div className="mt-4 sm:mt-6 flex justify-center">
                <Button onClick={onClose} className="w-full sm:w-auto">Close Host Session</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Fullscreen leaderboard during 5-second countdown
  if (showFullscreenLeaderboard) {
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score)
    
    return (
      <div className="fixed inset-0 bg-black dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center text-foreground max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-6xl font-bold mb-4 font-['Poppins'] text-white">Leaderboard</h1>
            <div className="text-2xl font-semibold mb-2 text-gray-300">Next question in:</div>
            <div className="text-8xl font-bold text-yellow-400">{leaderboardCountdown}</div>
          </div>
          
          <div className="space-y-4">
            {sortedParticipants.length === 0 ? (
              <div className="text-2xl text-gray-400">No participants yet</div>
            ) : (
              sortedParticipants.slice(0, 5).map((participant, index) => (
                <div key={participant.id} className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 ${
                   index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400 shadow-lg shadow-yellow-400/20' :
                   index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400 shadow-lg shadow-gray-400/20' :
                   index === 2 ? 'bg-gradient-to-r from-orange-400/20 to-orange-500/20 border-orange-400 shadow-lg shadow-orange-400/20' :
                   'bg-gradient-to-r from-gray-600/20 to-gray-700/20 border-gray-500 shadow-lg shadow-gray-500/20'
                 }`}>
                   <div className="flex items-center space-x-6">
                     <div className="flex items-center space-x-3">
                       {index === 0 && <Crown className="h-12 w-12 text-yellow-400 animate-pulse" />}
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 ${
                         index === 0 ? 'bg-yellow-500 border-yellow-400' :
                         index === 1 ? 'bg-gray-500 border-gray-400' :
                         index === 2 ? 'bg-orange-500 border-orange-400' :
                         'bg-gray-600 border-gray-500'
                       }`}>
                         {index + 1}
                       </div>
                     </div>
                     <div className="text-left">
                       <div className="font-bold text-3xl text-white font-['Poppins']">{participant.name}</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-3xl font-bold text-white">{participant.score}</div>
                     <div className="text-lg text-gray-300">pts</div>
                   </div>
                 </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black dark:bg-gray-900 p-3 sm:p-4 transition-colors duration-300 font-['Poppins']">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{quiz.title}</h1>
            <p className="text-sm sm:text-base text-gray-300">{quiz.description}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {sessionCode && (
              <div className="text-center">
                <div className="text-xs sm:text-sm text-gray-300">Session Code</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200" style={{fontFamily: 'Poppins, sans-serif', fontWeight: '600', letterSpacing: '0.1em'}}>{sessionCode}</div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <SimpleThemeToggle />
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Close</Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isWaitingRoom ? (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Waiting Room
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Share the session code with participants to join
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-4xl sm:text-6xl font-bold text-slate-800 dark:text-slate-200 mb-3 sm:mb-4" style={{fontFamily: 'Poppins, sans-serif', fontWeight: '600', letterSpacing: '0.1em'}}>{sessionCode}</div>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Participants can join using this code</p>
                    
                    <div className="flex justify-center mb-4 sm:mb-6">
                      <Button 
                        variant="outline" 
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(sessionCode)
                            // Show success feedback
                            const button = document.activeElement as HTMLButtonElement
                            const originalText = button.textContent
                            button.textContent = 'Copied!'
                            button.style.backgroundColor = '#10b981'
                            button.style.color = 'white'
                            setTimeout(() => {
                              button.textContent = originalText
                              button.style.backgroundColor = ''
                              button.style.color = ''
                            }, 2000)
                          } catch (err) {
                            console.error('Failed to copy session code:', err)
                            // Fallback for older browsers
                            const textArea = document.createElement('textarea')
                            textArea.value = sessionCode
                            document.body.appendChild(textArea)
                            textArea.select()
                            try {
                              document.execCommand('copy')
                              alert('Session code copied to clipboard!')
                            } catch (fallbackErr) {
                              console.error('Fallback copy failed:', fallbackErr)
                              alert(`Copy failed. Session code: ${sessionCode}`)
                            }
                            document.body.removeChild(textArea)
                          }
                        }}
                        className="flex items-center gap-2 transition-all duration-200"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Code
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={startQuiz} 
                      disabled={participants.length === 0}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz ({participants.length} participants)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : currentQuestion ? (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <CardTitle className="text-base sm:text-lg">
                      Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
                    </CardTitle>
                    <Badge variant={timeLeft <= 10 ? "destructive" : "outline"} className="self-start sm:self-auto">
                      <Clock className="h-3 w-3 mr-1" />
                      {timeLeft}s
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={(currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100} 
                      className="w-full"
                    />
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Time Remaining</span>
                        <span>{timeLeft}s / {currentQuestion.question.timeLimit}s</span>
                      </div>
                      <Progress 
                        value={(timeLeft / currentQuestion.question.timeLimit) * 100}
                        className="w-full h-2"
                        style={{
                          '--progress-background': timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#10b981'
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-lg sm:text-xl font-medium leading-relaxed">{currentQuestion.question.text}</div>
                    
                    {(currentQuestion.question as any).image && (
                      <div className="flex justify-center">
                        <img 
                          src={(currentQuestion.question as any).image}
                          alt="Question image" 
                          className="max-w-full h-auto max-h-64 rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="grid gap-2 sm:gap-3">
                      {currentQuestion.question.options.map((option, index) => (
                        <div key={index} className="p-2 sm:p-3 bg-gray-800 dark:bg-gray-700 rounded-lg border border-gray-700">
                          <span className="text-sm sm:text-base font-medium text-white">
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 sm:pt-4 gap-3 sm:gap-0">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        <span className="text-xs sm:text-sm text-gray-600">
                          {answeredParticipants.size} of {participants.length} answered
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button variant="outline" onClick={showLeaderboard} className="text-xs sm:text-sm">
                          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Show </span>Leaderboard
                        </Button>
                        <Button variant="outline" onClick={() => setInterludeType('poll')} disabled={!pollQuestion.trim() || !pollOptions.every(opt => opt.trim())} className="text-xs sm:text-sm">
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Start </span>Poll
                        </Button>
                        <Button onClick={nextQuestion} className="text-xs sm:text-sm">
                          <SkipForward className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
              <Card className="mt-4 sm:mt-6">
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <span className="flex items-center text-lg sm:text-xl">
                      {interludeType === 'leaderboard' ? (
                        <><BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />Current Leaderboard</>
                      ) : (
                        <><MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />Live Poll</>
                      )}
                    </span>
                    <Button variant="outline" onClick={interludeType === 'leaderboard' ? closeLeaderboard : closePoll} className="self-start sm:self-auto">
                      Close
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {interludeType === 'leaderboard' ? (
                    <div className="space-y-2 sm:space-y-3">
                      {participants
                        .sort((a, b) => b.score - a.score)
                        .map((participant, index) => (
                          <div key={participant.id} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-gray-600">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-600' : index === 2 ? 'bg-orange-400' : 'bg-gray-700'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="font-semibold text-sm sm:text-lg text-white">{participant.name}</span>
                            </div>
                            <Badge variant="secondary" className="text-sm sm:text-lg px-2 sm:px-3 py-1">
                              {participant.score} points
                            </Badge>
                          </div>
                        ))
                      }
                    </div>
                  ) : activePoll ? (
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold leading-relaxed">{activePoll.question}</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {activePoll.options.map((option, index) => {
                          const votes = pollResults[option] || 0
                          const totalVotes = Object.values(pollResults).reduce((sum, count) => sum + count, 0)
                          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
                          
                          return (
                            <div key={index} className="space-y-1 sm:space-y-2">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                                <span className="text-sm sm:text-base font-medium">{option}</span>
                                <span className="text-xs sm:text-sm text-gray-600">{votes} votes ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-black rounded-full h-2 sm:h-3">
                                <div 
                                  className="bg-blue-500 h-2 sm:h-3 rounded-full transition-all duration-300" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="text-center text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
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
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                  {participants.length === 0 ? (
                    <div className="text-center py-3 sm:py-4 text-gray-500 text-sm">
                      No participants yet
                    </div>
                  ) : (
                    participants
                      .sort((a, b) => b.score - a.score)
                      .map((participant, index) => (
                        <div key={participant.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-800 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-700 dark:bg-slate-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <span className="font-medium text-xs sm:text-sm text-white">{participant.name}</span>
                            {answeredParticipants.has(participant.id) && (
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
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
            
            {/* QR Code Section - Always Visible */}
            {sessionCode && (
              <Card className="mt-3 sm:mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <QrCode className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Join Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-3">
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200" style={{fontFamily: 'Poppins, sans-serif', fontWeight: '600', letterSpacing: '0.1em'}}>
                      {sessionCode}
                    </div>
                    
                    {qrCodeUrl && (
                      <div className="flex justify-center">
                        <img 
                          src={qrCodeUrl} 
                          alt="QR Code to join quiz" 
                          className="w-48 h-48 border-2 border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">Scan QR code or use session code to join</p>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(sessionCode)}
                      className="flex items-center gap-2 w-full"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Poll Creation Form */}
            {!isWaitingRoom && (
              <Card className="mt-3 sm:mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Create Poll
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Label htmlFor="poll-question" className="text-sm sm:text-base">Poll Question</Label>
                      <Input
                        id="poll-question"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        placeholder="Enter your poll question..."
                        className="mt-1 text-sm sm:text-base"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm sm:text-base">Poll Options</Label>
                      <div className="space-y-2 mt-1">
                        {pollOptions.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 text-sm sm:text-base"
                            />
                            {pollOptions.length > 2 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removePollOption(index)}
                                className="px-2 sm:px-3"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addPollOption}
                          disabled={pollOptions.length >= 6}
                          className="text-xs sm:text-sm"
                        >
                          Add Option
                        </Button>
                        <Button
                          size="sm"
                          onClick={showPoll}
                          disabled={!pollQuestion.trim() || !pollOptions.every(opt => opt.trim())}
                          className="text-xs sm:text-sm"
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