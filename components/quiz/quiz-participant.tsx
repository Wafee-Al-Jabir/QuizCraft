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
import { AchievementNotification, useAchievementNotification } from '@/components/ui/achievement-notification'
import { AlertCircle, Users, Clock, Trophy, CheckCircle, XCircle } from 'lucide-react'
import { useSocket } from '@/lib/socket-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { motion } from "framer-motion"

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
    image?: string
  }
}

interface LeaderboardEntry {
  id: string
  name: string
  score: number
}

export function QuizParticipant({ onClose }: QuizParticipantProps) {
  const { socket, isConnected } = useSocket()
  const { notification, showAchievement, hideAchievement } = useAchievementNotification()
  const [sessionCode, setSessionCode] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [joinStep, setJoinStep] = useState<'code' | 'name'>('code')
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
  const [connectionAttempted, setConnectionAttempted] = useState(false)

  // Give socket time to connect before showing connecting screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnectionAttempted(true)
    }, 2000) // Wait 2 seconds before showing connecting screen

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!socket || !isConnected) return

    // Listen for successful join
    socket.on('joined-quiz', (data) => {
      console.log('✅ Successfully joined quiz:', data)
      setHasJoined(true)
      setQuizInfo(data.quiz || data.quizInfo)
      setIsJoining(false)
      setError('')
      
      // If quiz is already active, set the current question immediately
      if (data.isActive && data.currentQuestion) {
        console.log('Joined active quiz - setting current question:', data.currentQuestion)
        setCurrentQuestion(data.currentQuestion)
        setTimeLeft(data.currentQuestion.question.timeLimit)
        setIsAnswered(false)
        setSelectedAnswer(data.currentQuestion.question.type === 'multiple-choice' ? [] : 0)
      }
    })

    // Listen for join errors
    socket.on('join-error', (data) => {
      setError(data.message)
      setIsJoining(false)
    })

    // Listen for quiz start
    socket.on('quiz-started', (data) => {
      console.log('Quiz started - received question data:', data)
      console.log('Question image:', data.question?.image)
      setCurrentQuestion(data)
      setTimeLeft(data.question.timeLimit)
      setIsAnswered(false)
      setSelectedAnswer(data.question.type === 'multiple-choice' ? [] : 0)
    })

    // Listen for next question
    socket.on('next-question', (data) => {
      console.log('Next question - received question data:', data)
      console.log('Question image:', data.question?.image)
      setCurrentQuestion(data)
      setTimeLeft(data.question.timeLimit)
      setIsAnswered(false)
      setSelectedAnswer(data.question.type === 'multiple-choice' ? [] : 0)
    })

    // Listen for answer submission result
    socket.on('answer-submitted', (data) => {
      console.log('Answer submitted result:', data)
      console.log('Previous score:', score, 'New total score:', data.totalScore)
      console.log('Points earned this question:', data.points)
      console.log('Is answer correct:', data.isCorrect)
      setScore(data.totalScore)
      setIsAnswered(true)
    })

    // Listen for quiz finish
    socket.on('quiz-finished', (data) => {
      setLeaderboard(data.leaderboard)
      setIsQuizFinished(true)
      setCurrentQuestion(null)
      setShowCelebration(true)
      
      // Check if user got first place and show achievement
      if (data.leaderboard.length > 0 && data.leaderboard[0].name === participantName) {
        setTimeout(() => {
          showAchievement({
            id: 'first-place',
            name: 'First Place Champion!',
            description: 'You finished in 1st place! Outstanding performance!',
            type: 'special',
            icon: '🥇'
          })
        }, 2000) // Show after celebration
      }
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

  // Timer effect - continues running even after answering
  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out (only if not already answered)
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

  const verifyCode = () => {
    if (!sessionCode.trim()) return
    
    // Redirect to the dynamic route with the session code
    window.location.href = `/quiz/join/${sessionCode.toUpperCase()}`
  }

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
      currentScore: score
    })
    
    console.log('Socket connected:', socket.connected)
    console.log('Socket ID:', socket.id)
    
    socket.emit('submit-answer', {
      sessionCode,
      questionId: currentQuestion.question.id,
      answer: selectedAnswer,
      timeSpent
    })
    
    setIsAnswered(true) // Set answered immediately to prevent double submission
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

  const handleGoToAchievements = () => {
    // For now, just close the quiz and let parent handle navigation
    // In a real app, this would navigate to achievements page
    onClose()
  }

  // Show connecting screen if not connected and connection has been attempted
  if (!isConnected && connectionAttempted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <h2 className="text-xl font-semibold text-center mb-2">Connecting...</h2>
            <p className="text-gray-400 text-center">Establishing connection to the quiz server</p>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="mt-4"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading screen during initial connection attempt
  if (!connectionAttempted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-pulse rounded-full h-12 w-12 bg-white/20 mb-4"></div>
            <h2 className="text-xl font-semibold text-center mb-2">Loading...</h2>
            <p className="text-gray-400 text-center">Initializing quiz system</p>
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
                      participant.name === participantName ? 'bg-indigo-600 border-2 border-indigo-400 text-white' : 'bg-black dark:bg-gray-900 text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-600' : index === 2 ? 'bg-orange-400' : 'bg-gray-700'
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300 font-[Poppins]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-indigo-600/10 p-3 rounded-2xl w-fit mb-4">
                <Trophy className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight font-[Poppins]">
                {joinStep === 'code' ? 'Join a Quiz' : 'Ready to Play?'}
              </CardTitle>
              <CardDescription className="text-base font-[Poppins]">
                {joinStep === 'code' 
                  ? 'Enter the 6-digit code to start your challenge' 
                  : 'Choose a nickname to enter the arena'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-[Poppins]">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              {joinStep === 'code' ? (
                <div className="flex flex-col items-center space-y-8">
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <Label htmlFor="sessionCode" className="text-sm font-semibold uppercase tracking-widest text-muted-foreground font-[Poppins]">
                      Enter Quiz Code
                    </Label>
                    <InputOTP
                      maxLength={6}
                      value={sessionCode}
                      onChange={(value) => {
                        setSessionCode(value.toUpperCase());
                        if (value.length === 6) {
                          // Small delay to allow user to see the last digit
                          setTimeout(() => {
                            window.location.href = `/quiz/join/${value.toUpperCase()}`;
                          }, 300);
                        }
                      }}
                      className="gap-3"
                      autoFocus
                    >
                      <InputOTPGroup className="gap-2">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot 
                            key={index} 
                            index={index} 
                            className="w-12 h-16 text-2xl font-bold border-2 rounded-xl focus:ring-indigo-500 bg-background/50"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  
                  <div className="flex w-full gap-3 pt-4">
                    <Button variant="ghost" onClick={onClose} className="flex-1 font-semibold font-[Poppins]">
                      Cancel
                    </Button>
                    <Button 
                      onClick={verifyCode} 
                      disabled={sessionCode.length !== 6}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20 font-[Poppins]"
                    >
                      Join Quiz
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="participantName" className="text-sm font-semibold font-[Poppins]">Your Nickname</Label>
                    <Input
                      id="participantName"
                      placeholder="e.g. QuizMaster99"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      className="h-12 text-lg font-[Poppins] bg-background/50 border-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>
                  
                  <div className="p-4 rounded-xl bg-muted/50 border flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground font-[Poppins]">Quiz Code</span>
                    <span className="text-lg font-bold font-mono tracking-widest text-indigo-600">{sessionCode}</span>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => setJoinStep('code')}
                      className="flex-1 font-semibold font-[Poppins]"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={joinQuiz} 
                      disabled={!participantName.trim() || isJoining}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20 font-[Poppins]"
                    >
                      {isJoining ? 'Joining...' : 'Start Playing'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-black dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
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
    <div className="min-h-screen bg-black dark:bg-gray-900 p-2 sm:p-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Score: {score} points</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span className="font-mono text-sm sm:text-base text-white animate-pulse font-bold transition-all duration-300">
                  {timeLeft}s
                </span>
              </div>
            </div>
            <Progress 
              value={(currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100} 
              className="w-full mt-2"
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              <div className="text-lg sm:text-xl font-medium leading-relaxed">
                {currentQuestion.question.text || 'Question text not available'}
              </div>
              
              {(() => {
                const imageUrl = (currentQuestion.question as any).image
                console.log('Rendering image check:', { imageUrl, hasImage: !!imageUrl })
                return imageUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={imageUrl} 
                      alt="Question image" 
                      className="max-w-full h-auto rounded-lg border border-gray-700 max-h-[300px]"
                      onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                      onError={(e) => console.error('Image failed to load:', imageUrl, e)}
                    />
                  </div>
                )
              })()}
              
              {currentQuestion.question.type === 'single-choice' ? (
                <RadioGroup 
                  value={selectedAnswer.toString()} 
                  onValueChange={(value) => handleAnswerChange(value, parseInt(value))}
                  disabled={isAnswered}
                >
                  {currentQuestion.question.options.map((option, index) => (
                    <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        <div className="p-2 sm:p-3 rounded-lg border hover:bg-gray-800 transition-colors bg-black dark:bg-gray-900 text-white">
                          <span className="text-sm sm:text-base font-medium text-white">
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {currentQuestion.question.options.map((option, index) => (
                    <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                      <Checkbox 
                        id={`option-${index}`}
                        checked={Array.isArray(selectedAnswer) && selectedAnswer.includes(index)}
                        onCheckedChange={(checked) => handleAnswerChange(checked, index)}
                        disabled={isAnswered}
                        className="mt-[10px]"
                      />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        <div className="p-2 sm:p-3 rounded-lg border hover:bg-gray-800 transition-colors bg-black dark:bg-gray-900 text-white">
                          <span className="text-sm sm:text-base font-medium text-white">
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 pt-4">
                <div className="text-xs sm:text-sm text-gray-600">
                  {isAnswered ? 'Answer submitted!' : 'Select your answer(s)'}
                </div>
                <Button 
                  onClick={submitAnswer}
                  disabled={isAnswered || timeLeft === 0 || 
                    (currentQuestion.question.type === 'single-choice' && selectedAnswer === 0 && !currentQuestion.question.options[0]) ||
                    (currentQuestion.question.type === 'multiple-choice' && (!Array.isArray(selectedAnswer) || selectedAnswer.length === 0))
                  }
                  className="w-full sm:w-auto"
                >
                  {isAnswered ? 'Submitted' : 'Submit Answer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Active Poll */}
        {activePoll && (
          <Card className="mt-4 sm:mt-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Live Poll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold leading-relaxed">{activePoll.question}</h3>
                
                {!hasPollResponded ? (
                  <div className="space-y-2 sm:space-y-3">
                    <RadioGroup value={pollResponse} onValueChange={setPollResponse}>
                      {activePoll.options.map((option, index) => (
                        <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                          <RadioGroupItem value={option} id={`poll-option-${index}`} className="mt-1" />
                          <Label htmlFor={`poll-option-${index}`} className="flex-1 cursor-pointer">
                            <div className="p-2 sm:p-3 rounded-lg border hover:bg-gray-800 transition-colors bg-black dark:bg-gray-900 text-white">
                              <span className="text-sm sm:text-base font-medium text-white">{option}</span>
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
                  <div className="text-center py-3 sm:py-4">
                    <div className="text-green-600 font-medium mb-2 text-sm sm:text-base">✓ Response submitted!</div>
                    <div className="text-xs sm:text-sm text-gray-600">Your response: {pollResponse}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-2">Waiting for poll results...</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Poll Results */}
        {pollResults && (
          <Card className="mt-4 sm:mt-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Poll Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold leading-relaxed">{pollResults.question}</h3>
                
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(pollResults.results).map(([option, votes]) => {
                    const totalVotes = Object.values(pollResults.results).reduce((sum, count) => sum + count, 0)
                    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
                    
                    return (
                      <div key={option} className="space-y-1 sm:space-y-2">
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
                  Total responses: {Object.values(pollResults.results).reduce((sum, count) => sum + count, 0)}
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setPollResults(null)}
                  className="w-full mt-3 sm:mt-4"
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
      <AchievementNotification
        show={notification.show}
        achievement={notification.achievement}
        onClose={hideAchievement}
        onGoToAchievements={handleGoToAchievements}
      />
    </div>
  )
}