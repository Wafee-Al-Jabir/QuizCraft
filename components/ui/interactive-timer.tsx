"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Zap, AlertTriangle, CheckCircle } from "lucide-react"
import { useSoundEffects } from "@/components/ui/sound-effects"

interface InteractiveTimerProps {
  duration: number // in seconds
  onTimeUp: () => void
  onWarning?: () => void // called when time is running low
  warningThreshold?: number // seconds remaining to trigger warning
  isActive: boolean
  isPaused?: boolean
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'circular' | 'linear' | 'minimal'
  className?: string
}

export function InteractiveTimer({
  duration,
  onTimeUp,
  onWarning,
  warningThreshold = 10,
  isActive,
  isPaused = false,
  showProgress = true,
  size = 'md',
  variant = 'circular',
  className = ''
}: InteractiveTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [hasWarned, setHasWarned] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const { playSound } = useSoundEffects()

  const progress = (timeLeft / duration) * 100
  const isWarning = timeLeft <= warningThreshold
  const isCritical = timeLeft <= 5

  useEffect(() => {
    setTimeLeft(duration)
    setHasWarned(false)
  }, [duration])

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1
          
          // Warning sound
          if (newTime === warningThreshold && !hasWarned) {
            setHasWarned(true)
            onWarning?.()
            playSound('whoosh')
          }
          
          // Critical sounds
          if (newTime <= 5 && newTime > 0) {
            playSound('click')
          }
          
          // Time up
          if (newTime <= 0) {
            onTimeUp()
            playSound('incorrect')
            return 0
          }
          
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, timeLeft, warningThreshold, hasWarned, onTimeUp, onWarning, playSound])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const sizeClasses = {
    sm: 'w-16 h-16 text-sm',
    md: 'w-24 h-24 text-lg',
    lg: 'w-32 h-32 text-xl'
  }

  if (variant === 'circular') {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={`transition-colors duration-300 ${
              isCritical
                ? 'text-red-500'
                : isWarning
                ? 'text-yellow-500'
                : 'text-blue-500'
            }`}
            style={{
              strokeDasharray: `${2 * Math.PI * 45}`,
              strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`
            }}
            animate={{
              strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`,
              ...(isCritical && {
                filter: ['drop-shadow(0 0 8px rgb(239 68 68))', 'drop-shadow(0 0 0px rgb(239 68 68))'],
                transition: { duration: 0.5, repeat: Infinity, repeatType: 'reverse' }
              })
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </svg>
        
        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className={`font-bold transition-colors duration-300 ${
              isCritical
                ? 'text-red-500'
                : isWarning
                ? 'text-yellow-500'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            animate={isCritical ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
          >
            {formatTime(timeLeft)}
          </motion.div>
          
          {/* Warning icon */}
          <AnimatePresence>
            {isWarning && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="mt-1"
              >
                {isCritical ? (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                ) : (
                  <Clock className="h-3 w-3 text-yellow-500" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Pulse effect for critical time */}
        <AnimatePresence>
          {isCritical && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-500"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (variant === 'linear') {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Time Remaining</span>
          </div>
          <motion.div
            className={`font-bold text-lg ${
              isCritical
                ? 'text-red-500'
                : isWarning
                ? 'text-yellow-500'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            animate={isCritical ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
          >
            {formatTime(timeLeft)}
          </motion.div>
        </div>
        
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors duration-300 ${
              isCritical
                ? 'bg-red-500'
                : isWarning
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
            animate={{
              width: `${progress}%`,
              ...(isCritical && {
                boxShadow: ['0 0 10px rgb(239 68 68)', '0 0 20px rgb(239 68 68)', '0 0 10px rgb(239 68 68)'],
                transition: { duration: 0.5, repeat: Infinity }
              })
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
          
          {/* Animated stripes for critical time */}
          <AnimatePresence>
            {isCritical && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // Minimal variant
  return (
    <motion.div
      className={`flex items-center space-x-2 ${className}`}
      animate={isCritical ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
    >
      {isWarning ? (
        isCritical ? (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        ) : (
          <Clock className="h-5 w-5 text-yellow-500" />
        )
      ) : (
        <CheckCircle className="h-5 w-5 text-green-500" />
      )}
      
      <span
        className={`font-mono font-bold text-lg ${
          isCritical
            ? 'text-red-500'
            : isWarning
            ? 'text-yellow-500'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {formatTime(timeLeft)}
      </span>
      
      {showProgress && (
        <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isCritical
                ? 'bg-red-500'
                : isWarning
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      )}
    </motion.div>
  )
}

// Preset timer components
export function QuizTimer({ duration, onTimeUp, isActive }: {
  duration: number
  onTimeUp: () => void
  isActive: boolean
}) {
  return (
    <InteractiveTimer
      duration={duration}
      onTimeUp={onTimeUp}
      isActive={isActive}
      variant="circular"
      size="lg"
      warningThreshold={30}
      className="mx-auto"
    />
  )
}

export function CompactTimer({ duration, onTimeUp, isActive }: {
  duration: number
  onTimeUp: () => void
  isActive: boolean
}) {
  return (
    <InteractiveTimer
      duration={duration}
      onTimeUp={onTimeUp}
      isActive={isActive}
      variant="minimal"
      size="sm"
      warningThreshold={10}
    />
  )
}

export function ProgressTimer({ duration, onTimeUp, isActive }: {
  duration: number
  onTimeUp: () => void
  isActive: boolean
}) {
  return (
    <InteractiveTimer
      duration={duration}
      onTimeUp={onTimeUp}
      isActive={isActive}
      variant="linear"
      warningThreshold={15}
      className="w-full max-w-md"
    />
  )
}