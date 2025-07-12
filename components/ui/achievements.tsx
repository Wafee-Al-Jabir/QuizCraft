"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Clock, 
  Brain, 
  Fire, 
  Crown, 
  Shield, 
  Gem,
  Award,
  Medal,
  CheckCircle,
  Lock,
  Progress
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { useSoundEffects } from './sound-effects'
import { Celebration } from './celebration'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  category: 'quiz' | 'streak' | 'speed' | 'accuracy' | 'social' | 'special'
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  points: number
  requirement: {
    type: 'count' | 'percentage' | 'time' | 'streak' | 'special'
    target: number
    current?: number
  }
  unlocked: boolean
  unlockedAt?: Date
  hidden?: boolean // Secret achievements
}

const ACHIEVEMENT_DATA: Omit<Achievement, 'id' | 'unlocked' | 'unlockedAt'>[] = [
  // Quiz Achievements
  {
    title: 'First Steps',
    description: 'Complete your first quiz',
    icon: Trophy,
    category: 'quiz',
    rarity: 'bronze',
    points: 10,
    requirement: { type: 'count', target: 1, current: 0 }
  },
  {
    title: 'Quiz Master',
    description: 'Complete 50 quizzes',
    icon: Crown,
    category: 'quiz',
    rarity: 'gold',
    points: 100,
    requirement: { type: 'count', target: 50, current: 0 }
  },
  {
    title: 'Quiz Legend',
    description: 'Complete 200 quizzes',
    icon: Gem,
    category: 'quiz',
    rarity: 'diamond',
    points: 500,
    requirement: { type: 'count', target: 200, current: 0 }
  },
  
  // Accuracy Achievements
  {
    title: 'Sharp Shooter',
    description: 'Achieve 90% accuracy in a quiz',
    icon: Target,
    category: 'accuracy',
    rarity: 'silver',
    points: 25,
    requirement: { type: 'percentage', target: 90, current: 0 }
  },
  {
    title: 'Perfect Score',
    description: 'Get 100% accuracy in a quiz',
    icon: Star,
    category: 'accuracy',
    rarity: 'gold',
    points: 50,
    requirement: { type: 'percentage', target: 100, current: 0 }
  },
  {
    title: 'Flawless Streak',
    description: 'Get 100% accuracy in 5 consecutive quizzes',
    icon: Shield,
    category: 'accuracy',
    rarity: 'platinum',
    points: 200,
    requirement: { type: 'streak', target: 5, current: 0 }
  },
  
  // Speed Achievements
  {
    title: 'Speed Demon',
    description: 'Complete a quiz in under 2 minutes',
    icon: Zap,
    category: 'speed',
    rarity: 'silver',
    points: 30,
    requirement: { type: 'time', target: 120, current: 0 }
  },
  {
    title: 'Lightning Fast',
    description: 'Complete a quiz in under 1 minute',
    icon: Clock,
    category: 'speed',
    rarity: 'gold',
    points: 75,
    requirement: { type: 'time', target: 60, current: 0 }
  },
  
  // Streak Achievements
  {
    title: 'On Fire',
    description: 'Get a 10 question streak',
    icon: Fire,
    category: 'streak',
    rarity: 'bronze',
    points: 20,
    requirement: { type: 'streak', target: 10, current: 0 }
  },
  {
    title: 'Unstoppable',
    description: 'Get a 25 question streak',
    icon: Brain,
    category: 'streak',
    rarity: 'silver',
    points: 50,
    requirement: { type: 'streak', target: 25, current: 0 }
  },
  {
    title: 'Legendary Streak',
    description: 'Get a 50 question streak',
    icon: Award,
    category: 'streak',
    rarity: 'platinum',
    points: 150,
    requirement: { type: 'streak', target: 50, current: 0 }
  },
  
  // Special/Hidden Achievements
  {
    title: 'Night Owl',
    description: 'Complete a quiz between 12 AM and 6 AM',
    icon: Medal,
    category: 'special',
    rarity: 'silver',
    points: 25,
    requirement: { type: 'special', target: 1, current: 0 },
    hidden: true
  },
  {
    title: 'Weekend Warrior',
    description: 'Complete 10 quizzes on weekends',
    icon: Shield,
    category: 'special',
    rarity: 'gold',
    points: 75,
    requirement: { type: 'count', target: 10, current: 0 },
    hidden: true
  }
]

const RARITY_COLORS = {
  bronze: 'from-amber-600 to-amber-700',
  silver: 'from-gray-400 to-gray-500',
  gold: 'from-yellow-400 to-yellow-500',
  platinum: 'from-purple-400 to-purple-500',
  diamond: 'from-cyan-400 to-cyan-500'
}

const RARITY_BORDERS = {
  bronze: 'border-amber-500',
  silver: 'border-gray-400',
  gold: 'border-yellow-400',
  platinum: 'border-purple-400',
  diamond: 'border-cyan-400'
}

const RARITY_GLOWS = {
  bronze: 'shadow-amber-500/25',
  silver: 'shadow-gray-400/25',
  gold: 'shadow-yellow-400/25',
  platinum: 'shadow-purple-400/25',
  diamond: 'shadow-cyan-400/25'
}

const CATEGORY_COLORS = {
  quiz: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  streak: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  speed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  accuracy: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  social: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  special: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
}

interface AchievementCardProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  onClick?: () => void
  className?: string
}

export function AchievementCard({ 
  achievement, 
  size = 'md', 
  showProgress = true, 
  onClick,
  className 
}: AchievementCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const { playSound } = useSoundEffects()
  
  const IconComponent = achievement.icon
  const progress = achievement.requirement.current || 0
  const target = achievement.requirement.target
  const progressPercentage = Math.min((progress / target) * 100, 100)
  
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  }
  
  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32
  }

  useEffect(() => {
    if (achievement.unlocked && achievement.unlockedAt) {
      const timeSinceUnlock = Date.now() - achievement.unlockedAt.getTime()
      if (timeSinceUnlock < 5000) { // Show celebration for 5 seconds
        setShowCelebration(true)
        playSound('achievement')
        setTimeout(() => setShowCelebration(false), 5000)
      }
    }
  }, [achievement.unlocked, achievement.unlockedAt, playSound])

  return (
    <>
      <motion.div
        className={cn(
          'relative rounded-lg border-2 cursor-pointer transition-all duration-300',
          achievement.unlocked 
            ? cn(RARITY_BORDERS[achievement.rarity], RARITY_GLOWS[achievement.rarity])
            : 'border-gray-300 dark:border-gray-600',
          achievement.unlocked ? 'hover:shadow-lg' : 'opacity-60',
          sizeClasses[size],
          className
        )}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
        layout
      >
        {/* Background gradient for unlocked achievements */}
        {achievement.unlocked && (
          <div className={cn(
            'absolute inset-0 rounded-lg bg-gradient-to-br opacity-10',
            RARITY_COLORS[achievement.rarity]
          )} />
        )}
        
        {/* Lock overlay for locked achievements */}
        {!achievement.unlocked && achievement.hidden && (
          <div className="absolute inset-0 bg-gray-900/50 dark:bg-gray-100/50 rounded-lg flex items-center justify-center">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        <div className="relative z-10 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className={cn(
                  'p-2 rounded-lg',
                  achievement.unlocked 
                    ? cn('bg-gradient-to-br', RARITY_COLORS[achievement.rarity])
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
                animate={{
                  rotate: isHovered && achievement.unlocked ? [0, -5, 5, 0] : 0,
                  scale: achievement.unlocked ? 1 : 0.8
                }}
                transition={{ duration: 0.3 }}
              >
                <IconComponent 
                  size={iconSizes[size]} 
                  className={achievement.unlocked ? 'text-white' : 'text-gray-400'}
                />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'font-semibold truncate',
                  achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                )}>
                  {achievement.hidden && !achievement.unlocked ? '???' : achievement.title}
                </h3>
                
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', CATEGORY_COLORS[achievement.category])}
                  >
                    {achievement.category}
                  </Badge>
                  
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      achievement.unlocked 
                        ? RARITY_BORDERS[achievement.rarity].replace('border-', 'border-')
                        : 'border-gray-300'
                    )}
                  >
                    {achievement.rarity}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Points */}
            <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
              <Star className="w-4 h-4" />
              <span className="font-medium text-sm">{achievement.points}</span>
            </div>
          </div>
          
          {/* Description */}
          <p className={cn(
            'text-sm leading-relaxed',
            achievement.unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
          )}>
            {achievement.hidden && !achievement.unlocked ? 'Hidden achievement' : achievement.description}
          </p>
          
          {/* Progress */}
          {showProgress && !achievement.unlocked && !achievement.hidden && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Progress</span>
                <span className="font-medium">
                  {progress} / {target}
                </span>
              </div>
              
              <ProgressBar value={progressPercentage} className="h-2" />
            </div>
          )}
          
          {/* Unlocked indicator */}
          {achievement.unlocked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center space-x-2 text-green-600 dark:text-green-400"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Unlocked!</span>
              {achievement.unlockedAt && (
                <span className="text-xs text-gray-500">
                  {achievement.unlockedAt.toLocaleDateString()}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Celebration effect */}
      <AnimatePresence>
        {showCelebration && (
          <Celebration />
        )}
      </AnimatePresence>
    </>
  )
}

// Achievement gallery component
interface AchievementGalleryProps {
  achievements: Achievement[]
  filter?: 'all' | 'unlocked' | 'locked' | Achievement['category']
  sortBy?: 'rarity' | 'category' | 'points' | 'progress'
  className?: string
}

export function AchievementGallery({ 
  achievements, 
  filter = 'all', 
  sortBy = 'rarity',
  className 
}: AchievementGalleryProps) {
  const [selectedFilter, setSelectedFilter] = useState(filter)
  const [selectedSort, setSelectedSort] = useState(sortBy)
  
  const filteredAchievements = achievements.filter(achievement => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'unlocked') return achievement.unlocked
    if (selectedFilter === 'locked') return !achievement.unlocked
    return achievement.category === selectedFilter
  })
  
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    switch (selectedSort) {
      case 'rarity':
        const rarityOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
        return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'points':
        return b.points - a.points
      case 'progress':
        const aProgress = (a.requirement.current || 0) / a.requirement.target
        const bProgress = (b.requirement.current || 0) / b.requirement.target
        return bProgress - aProgress
      default:
        return 0
    }
  })
  
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">Achievements</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {unlockedCount} / {achievements.length}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span className="font-medium">Total Points</span>
          </div>
          <div className="text-2xl font-bold mt-1">{totalPoints}</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2">
            <Progress className="w-5 h-5" />
            <span className="font-medium">Completion</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </div>
        </div>
      </div>
      
      {/* Filters and sorting */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Filter:</span>
          <select 
            value={selectedFilter} 
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All</option>
            <option value="unlocked">Unlocked</option>
            <option value="locked">Locked</option>
            <option value="quiz">Quiz</option>
            <option value="streak">Streak</option>
            <option value="speed">Speed</option>
            <option value="accuracy">Accuracy</option>
            <option value="social">Social</option>
            <option value="special">Special</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Sort by:</span>
          <select 
            value={selectedSort} 
            onChange={(e) => setSelectedSort(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="rarity">Rarity</option>
            <option value="category">Category</option>
            <option value="points">Points</option>
            <option value="progress">Progress</option>
          </select>
        </div>
      </div>
      
      {/* Achievement grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        layout
      >
        <AnimatePresence>
          {sortedAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <AchievementCard achievement={achievement} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// Hook for managing achievements
export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>(() => 
    ACHIEVEMENT_DATA.map((data, index) => ({
      ...data,
      id: `achievement_${index}`,
      unlocked: false
    }))
  )
  
  const updateProgress = (achievementId: string, progress: number) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId) {
        const newCurrent = Math.min(progress, achievement.requirement.target)
        const shouldUnlock = !achievement.unlocked && newCurrent >= achievement.requirement.target
        
        return {
          ...achievement,
          requirement: { ...achievement.requirement, current: newCurrent },
          unlocked: shouldUnlock || achievement.unlocked,
          unlockedAt: shouldUnlock ? new Date() : achievement.unlockedAt
        }
      }
      return achievement
    }))
  }
  
  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => prev.map(achievement => 
      achievement.id === achievementId 
        ? { ...achievement, unlocked: true, unlockedAt: new Date() }
        : achievement
    ))
  }
  
  const checkAchievements = (stats: {
    quizzesCompleted?: number
    accuracy?: number
    streak?: number
    timeSpent?: number
    isNightTime?: boolean
    isWeekend?: boolean
  }) => {
    achievements.forEach(achievement => {
      if (achievement.unlocked) return
      
      let shouldUpdate = false
      let newProgress = achievement.requirement.current || 0
      
      switch (achievement.requirement.type) {
        case 'count':
          if (achievement.category === 'quiz' && stats.quizzesCompleted) {
            newProgress = stats.quizzesCompleted
            shouldUpdate = true
          }
          break
        case 'percentage':
          if (achievement.category === 'accuracy' && stats.accuracy) {
            newProgress = stats.accuracy
            shouldUpdate = true
          }
          break
        case 'streak':
          if (achievement.category === 'streak' && stats.streak) {
            newProgress = stats.streak
            shouldUpdate = true
          }
          break
        case 'time':
          if (achievement.category === 'speed' && stats.timeSpent) {
            // For time-based achievements, we want lower times
            if (stats.timeSpent <= achievement.requirement.target) {
              newProgress = achievement.requirement.target
              shouldUpdate = true
            }
          }
          break
        case 'special':
          if (achievement.title === 'Night Owl' && stats.isNightTime) {
            newProgress = 1
            shouldUpdate = true
          }
          if (achievement.title === 'Weekend Warrior' && stats.isWeekend) {
            newProgress = (achievement.requirement.current || 0) + 1
            shouldUpdate = true
          }
          break
      }
      
      if (shouldUpdate) {
        updateProgress(achievement.id, newProgress)
      }
    })
  }
  
  return {
    achievements,
    updateProgress,
    unlockAchievement,
    checkAchievements
  }
}