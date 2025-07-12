"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Zap, Star, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSoundEffects } from './sound-effects'

interface StreakCounterProps {
  streak: number
  maxStreak?: number
  onStreakMilestone?: (milestone: number) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showFireworks?: boolean
}

const STREAK_MILESTONES = [3, 5, 10, 15, 20, 25, 30]
const STREAK_COLORS = {
  0: 'text-gray-400',
  3: 'text-orange-500',
  5: 'text-red-500',
  10: 'text-purple-500',
  15: 'text-blue-500',
  20: 'text-green-500',
  25: 'text-yellow-500',
  30: 'text-pink-500'
}

const STREAK_BACKGROUNDS = {
  0: 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700',
  3: 'from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800',
  5: 'from-red-100 to-red-200 dark:from-red-900 dark:to-red-800',
  10: 'from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800',
  15: 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800',
  20: 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-800',
  25: 'from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800',
  30: 'from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800'
}

function getStreakLevel(streak: number): number {
  if (streak >= 30) return 30
  if (streak >= 25) return 25
  if (streak >= 20) return 20
  if (streak >= 15) return 15
  if (streak >= 10) return 10
  if (streak >= 5) return 5
  if (streak >= 3) return 3
  return 0
}

function getStreakIcon(streak: number) {
  if (streak >= 25) return Trophy
  if (streak >= 15) return Star
  if (streak >= 5) return Zap
  if (streak >= 3) return Flame
  return Flame
}

export function StreakCounter({ 
  streak, 
  maxStreak = 0, 
  onStreakMilestone, 
  className, 
  size = 'md',
  showFireworks = true 
}: StreakCounterProps) {
  const [previousStreak, setPreviousStreak] = useState(streak)
  const [showMilestone, setShowMilestone] = useState(false)
  const [currentMilestone, setCurrentMilestone] = useState(0)
  const { playSound } = useSoundEffects()

  const level = getStreakLevel(streak)
  const IconComponent = getStreakIcon(streak)
  const colorClass = STREAK_COLORS[level as keyof typeof STREAK_COLORS]
  const backgroundClass = STREAK_BACKGROUNDS[level as keyof typeof STREAK_BACKGROUNDS]

  const sizeClasses = {
    sm: 'text-sm p-2',
    md: 'text-base p-3',
    lg: 'text-lg p-4'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  useEffect(() => {
    if (streak > previousStreak) {
      // Check for milestone
      const milestone = STREAK_MILESTONES.find(m => 
        streak >= m && previousStreak < m
      )
      
      if (milestone) {
        setCurrentMilestone(milestone)
        setShowMilestone(true)
        onStreakMilestone?.(milestone)
        playSound('streak')
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100])
        }
        
        setTimeout(() => setShowMilestone(false), 3000)
      } else if (streak > 0) {
        playSound('correct')
      }
    } else if (streak === 0 && previousStreak > 0) {
      // Streak broken
      playSound('incorrect')
      if ('vibrate' in navigator) {
        navigator.vibrate(200)
      }
    }
    
    setPreviousStreak(streak)
  }, [streak, previousStreak, onStreakMilestone, playSound])

  return (
    <div className={cn('relative', className)}>
      {/* Main streak counter */}
      <motion.div
        className={cn(
          'flex items-center space-x-2 rounded-full bg-gradient-to-r border-2 border-transparent',
          backgroundClass,
          sizeClasses[size],
          streak > 0 && 'shadow-lg'
        )}
        animate={{
          scale: streak > previousStreak ? [1, 1.1, 1] : 1,
          borderColor: streak > 0 ? ['transparent', colorClass.replace('text-', '#'), 'transparent'] : 'transparent'
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{
            rotate: streak > previousStreak ? [0, 360] : 0,
            scale: streak > 0 ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 0.5 }}
        >
          <IconComponent 
            size={iconSizes[size]} 
            className={cn(colorClass, streak === 0 && 'opacity-50')}
          />
        </motion.div>
        
        <div className="flex flex-col items-center">
          <motion.span 
            className={cn('font-bold', colorClass, streak === 0 && 'opacity-50')}
            animate={{
              scale: streak > previousStreak ? [1, 1.3, 1] : 1
            }}
            transition={{ duration: 0.3 }}
          >
            {streak}
          </motion.span>
          {maxStreak > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Best: {maxStreak}
            </span>
          )}
        </div>
      </motion.div>

      {/* Milestone celebration */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold whitespace-nowrap">
              🔥 {currentMilestone} Streak!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle effects for high streaks */}
      {showFireworks && streak >= 10 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: '50%',
                top: '50%'
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 60],
                y: [0, (Math.random() - 0.5) * 60],
                opacity: [1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Streak progress bar component
interface StreakProgressProps {
  current: number
  target: number
  className?: string
}

export function StreakProgress({ current, target, className }: StreakProgressProps) {
  const progress = Math.min((current / target) * 100, 100)
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Progress to {target} streak</span>
        <span>{current}/{target}</span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// Streak leaderboard component
interface StreakLeaderboardEntry {
  id: string
  name: string
  streak: number
  maxStreak: number
}

interface StreakLeaderboardProps {
  entries: StreakLeaderboardEntry[]
  currentUserId?: string
  className?: string
}

export function StreakLeaderboard({ entries, currentUserId, className }: StreakLeaderboardProps) {
  const sortedEntries = [...entries].sort((a, b) => b.maxStreak - a.maxStreak)
  
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="font-semibold text-lg mb-4">🔥 Streak Leaderboard</h3>
      
      {sortedEntries.map((entry, index) => {
        const isCurrentUser = entry.id === currentUserId
        const IconComponent = getStreakIcon(entry.maxStreak)
        const level = getStreakLevel(entry.maxStreak)
        const colorClass = STREAK_COLORS[level as keyof typeof STREAK_COLORS]
        
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border',
              isCurrentUser 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  #{index + 1}
                </span>
                <IconComponent size={16} className={colorClass} />
              </div>
              
              <div>
                <div className={cn(
                  'font-medium',
                  isCurrentUser && 'text-blue-600 dark:text-blue-400'
                )}>
                  {entry.name} {isCurrentUser && '(You)'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Current: {entry.streak}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={cn('font-bold text-lg', colorClass)}>
                {entry.maxStreak}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Best Streak
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}