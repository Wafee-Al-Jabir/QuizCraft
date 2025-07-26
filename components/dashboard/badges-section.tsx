"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as BadgeUI } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trophy, Star, Zap, Users, Target, Rocket, Globe, Award, Flame, ArrowRight, Crown } from "lucide-react"
import { useBadgeNotifications } from "@/components/ui/badge-notification"
import { StreakCounter } from "@/components/ui/streak-counter"
import { cn } from "@/lib/utils"
import type { LinkProps } from 'next/link'
import Link from "next/link"
import type { Badge, UserBadge, User } from "@/lib/types"

interface BadgesSectionProps {
  user: User
  stats: {
    totalQuizzes: number
    publishedQuizzes: number
    totalQuestions: number
    totalParticipants: number
    averageScore: number
    currentStreak?: number
    longestStreak?: number
  }
  className?: string
  currentStreak?: number
  longestStreak?: number
}

// Predefined streak-based badges with their requirements
const AVAILABLE_BADGES: Badge[] = [
  {
    id: "first_streak",
    type: "streak",
    name: "Getting Started",
    description: "Start your first streak",
    icon: "Flame",
    color: "from-orange-400 to-red-500",
    requirement: { type: "streak", value: 1 },
    rarity: "common"
  },
  {
    id: "streak_3",
    type: "streak",
    name: "On Fire",
    description: "Maintain a 3-day streak",
    icon: "Flame",
    color: "from-orange-500 to-red-600",
    requirement: { type: "streak", value: 3 },
    rarity: "common"
  },
  {
    id: "streak_7",
    type: "streak",
    name: "Streak Warrior",
    description: "Maintain a 7-day streak",
    icon: "Flame",
    color: "from-red-500 to-red-600",
    requirement: { type: "streak", value: 7 },
    rarity: "rare"
  },
  {
    id: "streak_15",
    type: "streak",
    name: "Dedication Master",
    description: "Maintain a 15-day streak",
    icon: "Star",
    color: "from-purple-500 to-purple-600",
    requirement: { type: "streak", value: 15 },
    rarity: "rare"
  },
  {
    id: "streak_30",
    type: "streak",
    name: "Unstoppable Force",
    description: "Maintain a 30-day streak",
    icon: "Trophy",
    color: "from-yellow-500 to-yellow-600",
    requirement: { type: "streak", value: 30 },
    rarity: "epic"
  },
  {
    id: "streak_100",
    type: "streak",
    name: "Legendary Streaker",
    description: "Maintain a 100-day streak",
    icon: "Award",
    color: "from-yellow-400 to-yellow-500",
    requirement: { type: "streak", value: 100 },
    rarity: "legendary"
  },
  {
    id: "first_quiz",
    type: "quiz_creator",
    name: "Quiz Creator",
    description: "Create your first quiz",
    icon: "Trophy",
    color: "from-blue-500 to-blue-600",
    requirement: { type: "quiz_count", value: 1 },
    rarity: "common"
  },
  {
    id: "quiz_master",
    type: "quiz_master",
    name: "Quiz Master",
    description: "Create 10 quizzes",
    icon: "Award",
    color: "from-purple-500 to-purple-600",
    requirement: { type: "quiz_count", value: 10 },
    rarity: "rare"
  },
  {
    id: "perfectionist",
    type: "perfectionist",
    name: "Perfectionist",
    description: "Achieve 100% average score",
    icon: "Target",
    color: "from-pink-500 to-pink-600",
    requirement: { type: "perfect_score", value: 100 },
    rarity: "epic"
  }
]

const getIconComponent = (iconName: string) => {
  const icons = {
    Trophy,
    Star,
    Zap,
    Users,
    Target,
    Rocket,
    Globe,
    Award,
    Flame
  }
  return icons[iconName as keyof typeof icons] || Trophy
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common": return "border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
    case "rare": return "border-blue-300 bg-blue-100 text-blue-900 dark:border-blue-600 dark:bg-blue-900 dark:text-white"
    case "epic": return "border-purple-300 bg-purple-100 text-purple-900 dark:border-purple-600 dark:bg-purple-900 dark:text-white"
    case "legendary": return "border-yellow-300 bg-yellow-100 text-yellow-900 dark:border-yellow-600 dark:bg-yellow-900 dark:text-white"
    case "ultimate": return "border-red-300 bg-red-100 text-red-900 dark:border-red-600 dark:bg-red-900 dark:text-white"
    default: return "border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
  }
}

const calculateProgress = (badge: Badge, stats: any): { progress: number; maxProgress: number; isUnlocked: boolean } => {
  let progress = 0
  let maxProgress = badge.requirement.value
  
  // Ensure stats has default values
  const safeStats = {
    totalQuizzes: stats?.totalQuizzes || 0,
    totalParticipants: stats?.totalParticipants || 0,
    averageScore: stats?.averageScore || 0,
    totalQuestions: stats?.totalQuestions || 0,
    currentStreak: stats?.currentStreak || 0,
    longestStreak: stats?.longestStreak || 0,
    questionTypesUsed: stats?.questionTypesUsed || [],
    quizzesToday: stats?.quizzesToday || 0,
    ...stats
  }
  
  switch (badge.requirement.type) {
    case "quiz_count":
      progress = safeStats.totalQuizzes
      break
    case "participant_count":
      progress = safeStats.totalParticipants
      break
    case "perfect_score":
      progress = Math.round(safeStats.averageScore)
      break
    case "exploration":
      // Track unique question types used (assuming we have this data)
      progress = safeStats.questionTypesUsed?.length || Math.min(safeStats.totalQuizzes, maxProgress)
      break
    case "speed":
      // Track quizzes created today or in a short timeframe
      progress = safeStats.quizzesToday || Math.min(safeStats.totalQuizzes, maxProgress)
      break
    case "question_count":
      progress = safeStats.totalQuestions
      break
    case "streak":
      progress = Math.max(safeStats.currentStreak || 0, safeStats.longestStreak || 0)
      break
    default:
      progress = 0
  }
  
  const finalProgress = Math.min(progress, maxProgress)
  const isUnlocked = finalProgress >= maxProgress
  
  // Debug logging for badge progress
  console.log(`Badge ${badge.id} progress:`, {
    badgeId: badge.id,
    requirementType: badge.requirement.type,
    progress: finalProgress,
    maxProgress,
    isUnlocked,
    stats: safeStats
  })
  
  return {
    progress: finalProgress,
    maxProgress,
    isUnlocked
  }
}

export function BadgesSection({ user, stats, className, currentStreak = 0, longestStreak = 0 }: BadgesSectionProps) {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [previousStats, setPreviousStats] = useState<any>(null)
  const { checkForNewBadges } = useBadgeNotifications()
  const isInitialMount = useRef(true)
  
  // Debug: Log stats to see what we're working with
  console.log('Badge Section Stats:', stats)
  
  // Ensure stats has default values
    const safeStats = {
      totalQuizzes: stats?.totalQuizzes || 0,
      publishedQuizzes: stats?.publishedQuizzes || 0,
      totalParticipants: stats?.totalParticipants || 0,
      averageScore: stats?.averageScore || 0,
      totalQuestions: stats?.totalQuestions || 0,
      currentStreak: stats?.currentStreak || currentStreak || 0,
      longestStreak: stats?.longestStreak || longestStreak || 0,
      questionTypesUsed: ['multiple-choice', 'true-false', 'short-answer'], // Default question types
      quizzesToday: 0, // Default value
      perfectScores: 0 // Default value
    }
  
  // Calculate badge progress for all available badges
  const badgeProgress = AVAILABLE_BADGES.map(badge => {
    let progress = 0
    const requirement = badge.requirement
    
    switch (requirement.type) {
      case "quiz_count":
        progress = safeStats.totalQuizzes
        break
      case "question_count":
        progress = safeStats.totalQuestions
        break
      case "participant_count":
        progress = safeStats.totalParticipants
        break
      case "perfect_score":
        progress = safeStats.perfectScores
        break
      case "speed":
        progress = safeStats.quizzesToday
        break
      case "exploration":
        progress = safeStats.questionTypesUsed.length
        break
      case "streak":
        progress = Math.max(safeStats.currentStreak, safeStats.longestStreak)
        break
      default:
        progress = 0
    }
    
    const isUnlocked = progress >= requirement.value
    const progressPercentage = Math.min((progress / requirement.value) * 100, 100)
    
    return {
      ...badge,
      progress,
      maxProgress: requirement.value,
      isUnlocked,
      progressPercentage
    }
  })
  
  const unlockedBadges = badgeProgress.filter(badge => badge.isUnlocked)
  const inProgressBadges = badgeProgress.filter(badge => !badge.isUnlocked && badge.progress > 0)
  const lockedBadges = badgeProgress.filter(badge => !badge.isUnlocked && badge.progress === 0)
  
  // Check for newly unlocked badges and show notifications
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      setPreviousStats(stats)
      return
    }
    
    if (previousStats) {
      const newlyUnlockedBadges = checkForNewBadges(previousStats, stats, AVAILABLE_BADGES)
      if (newlyUnlockedBadges.length > 0) {
        console.log('New badges unlocked:', newlyUnlockedBadges)
      }
    }
    
    setPreviousStats(stats)
  }, [stats, previousStats, checkForNewBadges])

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Streaks & Achievements
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {unlockedBadges.length} / {AVAILABLE_BADGES.length} unlocked
        </div>
      </div>
      
      {/* Streak Counter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          🔥 Your Learning Streak
        </h3>
        <div className="flex items-center justify-center">
          <StreakCounter 
            streak={currentStreak || safeStats.currentStreak || 0}
            maxStreak={longestStreak || safeStats.longestStreak || 0}
            size="lg"
            onStreakMilestone={(milestone) => {
              // Handle milestone achievements
              console.log(`Milestone reached: ${milestone}`)
            }}
          />
        </div>
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Keep learning daily to maintain your streak!
        </div>
      </div>
      {/* Badges Overview */}
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-md">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Achievements</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Your quiz creation journey</CardDescription>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Link href="/badges" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{unlockedBadges.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressBadges.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">{lockedBadges.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Locked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {unlockedBadges.filter(b => b.rarity === 'legendary').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Legendary</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Badges Preview */}
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Award className="h-5 w-5 text-purple-400" />
            <span>Badge Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badgeProgress.slice(0, 6).map((badge) => {
              const IconComponent = getIconComponent(badge.icon)
              return (
                <TooltipProvider key={badge.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative p-3 rounded-lg border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md hover:shadow-gray-300/50 dark:hover:shadow-gray-700/50 transition-all duration-200 cursor-pointer">
                        {badge.isUnlocked && (
                          <div className="absolute -top-1 -right-1 z-10">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                          </div>
                        )}
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center mx-auto mb-2 ${badge.isUnlocked ? 'shadow-lg shadow-yellow-500/30' : 'opacity-60'}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-xs truncate text-gray-900 dark:text-white">{badge.name}</div>
                          {!badge.isUnlocked && (
                            <div className="mt-1">
                              <Progress value={badge.progressPercentage} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 dark:text-white">{badge.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{badge.description}</div>
                        {badge.isUnlocked ? (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            Completed!
                          </div>
                        ) : (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {badge.progress}/{badge.maxProgress} ({Math.round(badge.progressPercentage)}%)
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}