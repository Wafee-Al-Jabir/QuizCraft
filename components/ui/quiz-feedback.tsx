"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Clock, Zap, Target, TrendingUp, Award, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSoundEffects } from "@/components/ui/sound-effects"
import { SuccessParticles, ErrorParticles, CelebrationParticles } from "@/components/ui/particle-system"

interface QuizFeedbackProps {
  isCorrect: boolean
  correctAnswer: string
  userAnswer: string
  explanation?: string
  timeSpent: number
  streak: number
  isVisible: boolean
  onNext: () => void
  showNext?: boolean
}

interface PerformanceMetrics {
  accuracy: number
  averageTime: number
  streak: number
  totalQuestions: number
  correctAnswers: number
}

const FEEDBACK_MESSAGES = {
  correct: {
    fast: [
      "Lightning fast! ⚡",
      "Speed demon! 🚀",
      "Quick thinking! 💨",
      "Blazing speed! 🔥"
    ],
    normal: [
      "Well done! 👏",
      "Excellent! ✨",
      "Perfect! 🎯",
      "Great job! 🌟"
    ],
    slow: [
      "Correct! Take your time 🐢",
      "Right answer! 👍",
      "Good thinking! 🤔",
      "Steady wins! 🏆"
    ]
  },
  incorrect: {
    close: [
      "So close! 😅",
      "Almost there! 💪",
      "Good attempt! 🎯",
      "Keep trying! 🌟"
    ],
    far: [
      "Not quite right 🤔",
      "Let's learn together! 📚",
      "Every mistake is progress! 🚀",
      "Keep going! 💪"
    ]
  }
}

const STREAK_MESSAGES = {
  5: "🔥 On fire! 5 in a row!",
  10: "🚀 Unstoppable! 10 streak!",
  15: "⭐ Amazing! 15 streak!",
  20: "👑 Legendary! 20 streak!",
  25: "🏆 Godlike! 25 streak!"
}

export function QuizFeedback({
  isCorrect,
  correctAnswer,
  userAnswer,
  explanation,
  timeSpent,
  streak,
  isVisible,
  onNext,
  showNext = true
}: QuizFeedbackProps) {
  const [showParticles, setShowParticles] = useState(false)
  const { playSound } = useSoundEffects()

  useEffect(() => {
    if (isVisible) {
      setShowParticles(true)
      playSound(isCorrect ? 'correct' : 'incorrect')
      
      // Special streak sounds
      if (isCorrect && streak >= 5) {
        setTimeout(() => playSound('streak'), 500)
      }
      
      setTimeout(() => setShowParticles(false), 3000)
    }
  }, [isVisible, isCorrect, streak, playSound])

  const getFeedbackMessage = () => {
    if (isCorrect) {
      const category = timeSpent < 5 ? 'fast' : timeSpent > 15 ? 'slow' : 'normal'
      const messages = FEEDBACK_MESSAGES.correct[category]
      return messages[Math.floor(Math.random() * messages.length)]
    } else {
      // Simple heuristic for "close" vs "far" - could be improved with actual answer analysis
      const isClose = userAnswer.toLowerCase().includes(correctAnswer.toLowerCase().substring(0, 2))
      const category = isClose ? 'close' : 'far'
      const messages = FEEDBACK_MESSAGES.incorrect[category]
      return messages[Math.floor(Math.random() * messages.length)]
    }
  }

  const getTimePerformance = () => {
    if (timeSpent < 5) return { label: 'Lightning Fast', color: 'text-yellow-500', icon: <Zap className="h-4 w-4" /> }
    if (timeSpent < 10) return { label: 'Quick', color: 'text-green-500', icon: <Target className="h-4 w-4" /> }
    if (timeSpent < 20) return { label: 'Steady', color: 'text-blue-500', icon: <Clock className="h-4 w-4" /> }
    return { label: 'Thoughtful', color: 'text-purple-500', icon: <TrendingUp className="h-4 w-4" /> }
  }

  const timePerf = getTimePerformance()
  const streakMessage = STREAK_MESSAGES[streak as keyof typeof STREAK_MESSAGES]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative"
        >
          <Card className={`border-2 ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-red-500 bg-red-50 dark:bg-red-950/20'}`}>
            <CardContent className="p-6">
              {/* Main feedback */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="mb-4"
                >
                  {isCorrect ? (
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                  )}
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}
                >
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-600 dark:text-gray-300"
                >
                  {getFeedbackMessage()}
                </motion.p>
              </div>

              {/* Performance metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                <div className="text-center">
                  <div className={`flex items-center justify-center space-x-1 ${timePerf.color} mb-1`}>
                    {timePerf.icon}
                    <span className="font-medium">{timePerf.label}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {timeSpent}s response time
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-orange-500 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="font-medium">Streak: {streak}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {streak > 0 ? 'Keep it up!' : 'Start your streak!'}
                  </div>
                </div>
              </motion.div>

              {/* Streak celebration */}
              <AnimatePresence>
                {streakMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center mb-4"
                  >
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-4 py-2">
                      {streakMessage}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Answer details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3 mb-6"
              >
                {!isCorrect && (
                  <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
                    <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                      Your answer:
                    </div>
                    <div className="text-red-600 dark:text-red-400">{userAnswer}</div>
                  </div>
                )}
                
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                    Correct answer:
                  </div>
                  <div className="text-green-600 dark:text-green-400">{correctAnswer}</div>
                </div>
                
                {explanation && (
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Explanation:
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">{explanation}</div>
                  </div>
                )}
              </motion.div>

              {/* Next button */}
              {showNext && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-center"
                >
                  <Button
                    onClick={onNext}
                    size="lg"
                    className={`${isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-8`}
                  >
                    Continue
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Particle effects */}
          {isCorrect ? (
            streak >= 10 ? (
              <CelebrationParticles active={showParticles} />
            ) : (
              <SuccessParticles active={showParticles} />
            )
          ) : (
            <ErrorParticles active={showParticles} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function QuizSummary({ metrics }: { metrics: PerformanceMetrics }) {
  const { playSound } = useSoundEffects()
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (metrics.accuracy >= 80) {
      setShowCelebration(true)
      playSound('celebration')
      setTimeout(() => setShowCelebration(false), 4000)
    }
  }, [metrics.accuracy, playSound])

  const getGrade = (accuracy: number) => {
    if (accuracy >= 95) return { grade: 'A+', color: 'text-green-500', message: 'Outstanding!' }
    if (accuracy >= 90) return { grade: 'A', color: 'text-green-500', message: 'Excellent!' }
    if (accuracy >= 80) return { grade: 'B', color: 'text-blue-500', message: 'Great job!' }
    if (accuracy >= 70) return { grade: 'C', color: 'text-yellow-500', message: 'Good effort!' }
    if (accuracy >= 60) return { grade: 'D', color: 'text-orange-500', message: 'Keep practicing!' }
    return { grade: 'F', color: 'text-red-500', message: 'Try again!' }
  }

  const gradeInfo = getGrade(metrics.accuracy)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 0.6 }}
      className="relative"
    >
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mb-6"
          >
            <Award className="h-20 w-20 mx-auto text-yellow-300" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-2"
          >
            Quiz Complete!
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-6xl font-bold mb-2 ${gradeInfo.color}`}
          >
            {gradeInfo.grade}
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl mb-6 opacity-90"
          >
            {gradeInfo.message}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
          >
            <div>
              <div className="text-2xl font-bold">{metrics.accuracy}%</div>
              <div className="text-sm opacity-80">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.correctAnswers}/{metrics.totalQuestions}</div>
              <div className="text-sm opacity-80">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.averageTime}s</div>
              <div className="text-sm opacity-80">Avg Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.streak}</div>
              <div className="text-sm opacity-80">Best Streak</div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
      
      {showCelebration && <CelebrationParticles active={true} />}
    </motion.div>
  )
}

export function LiveFeedback({ isCorrect, streak }: { isCorrect: boolean; streak: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg ${
        isCorrect ? 'bg-green-500' : 'bg-red-500'
      } text-white`}>
        {isCorrect ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
        <span className="font-medium">
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </span>
        {streak > 1 && (
          <Badge className="bg-white/20 text-white">
            {streak}x
          </Badge>
        )}
      </div>
    </motion.div>
  )
}