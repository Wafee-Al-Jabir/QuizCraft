"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as BadgeUI } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trophy, Star, Zap, Users, Target, Rocket, Globe, Award, ArrowRight } from "lucide-react"
import { useBadgeNotifications } from "@/components/ui/badge-notification"
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
  }
}

// Predefined badges with their requirements
const AVAILABLE_BADGES: Badge[] = [
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
    id: "quiz_legend",
    type: "quiz_master",
    name: "Quiz Legend",
    description: "Create 50 quizzes",
    icon: "Star",
    color: "from-yellow-500 to-yellow-600",
    requirement: { type: "quiz_count", value: 50 },
    rarity: "legendary"
  },
  {
    id: "crowd_pleaser",
    type: "social_butterfly",
    name: "Crowd Pleaser",
    description: "Reach 100 total participants",
    icon: "Users",
    color: "from-green-500 to-green-600",
    requirement: { type: "participant_count", value: 100 },
    rarity: "rare"
  },
  {
    id: "viral_creator",
    type: "social_butterfly",
    name: "Viral Creator",
    description: "Reach 1000 total participants",
    icon: "Rocket",
    color: "from-red-500 to-red-600",
    requirement: { type: "participant_count", value: 1000 },
    rarity: "legendary"
  },
  {
    id: "explorer",
    type: "explorer",
    name: "Explorer",
    description: "Create quizzes with all question types",
    icon: "Globe",
    color: "from-indigo-500 to-indigo-600",
    requirement: { type: "exploration", value: 5 },
    rarity: "epic"
  },
  {
    id: "perfectionist",
    type: "perfectionist",
    name: "Perfectionist",
    description: "Create a quiz with perfect average score",
    icon: "Target",
    color: "from-pink-500 to-pink-600",
    requirement: { type: "perfect_score", value: 100 },
    rarity: "epic"
  },
  {
    id: "speed_demon",
    type: "speed_demon",
    name: "Speed Demon",
    description: "Create 5 quizzes in one day",
    icon: "Zap",
    color: "from-orange-500 to-orange-600",
    requirement: { type: "speed", value: 5 },
    rarity: "rare"
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
    Award
  }
  return icons[iconName as keyof typeof icons] || Trophy
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common": return "border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
    case "rare": return "border-blue-300 bg-blue-100 text-blue-900 dark:border-blue-600 dark:bg-blue-900 dark:text-white"
    case "epic": return "border-purple-300 bg-purple-100 text-purple-900 dark:border-purple-600 dark:bg-purple-900 dark:text-white"
    case "legendary": return "border-yellow-300 bg-yellow-100 text-yellow-900 dark:border-yellow-600 dark:bg-yellow-900 dark:text-white"
    default: return "border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
  }
}

const calculateProgress = (badge: Badge, stats: any): { progress: number; maxProgress: number; isUnlocked: boolean } => {
  let progress = 0
  let maxProgress = badge.requirement.value
  
  switch (badge.requirement.type) {
    case "quiz_count":
      progress = stats.totalQuizzes
      // Debug for Quiz Creator badge
      if (badge.id === 'first_quiz') {
        console.log('Quiz Creator Badge Debug:', {
          badgeId: badge.id,
          totalQuizzes: stats.totalQuizzes,
          progress,
          maxProgress,
          willUnlock: progress >= maxProgress
        })
      }
      break
    case "participant_count":
      progress = stats.totalParticipants
      break
    case "perfect_score":
      progress = Math.round(stats.averageScore || 0)
      break
    case "exploration":
      // This would need more complex logic to track question types used
      progress = Math.min(stats.totalQuizzes, maxProgress)
      break
    case "speed":
      // This would need date tracking - for now, just use total quizzes
      progress = Math.min(stats.totalQuizzes, maxProgress)
      break
    default:
      progress = 0
  }
  
  return {
    progress: Math.min(progress, maxProgress),
    maxProgress,
    isUnlocked: progress >= maxProgress
  }
}

export function BadgesSection({ user, stats }: BadgesSectionProps) {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [previousStats, setPreviousStats] = useState<any>(null)
  const { checkForNewBadges } = useBadgeNotifications()
  const isInitialMount = useRef(true)
  
  // Debug: Log stats to see what we're working with
  console.log('Badge Section Stats:', stats)
  
  // Calculate badge progress for all available badges
  const badgeProgress = AVAILABLE_BADGES.map(badge => {
    const progress = calculateProgress(badge, stats)
    return {
      ...badge,
      ...progress
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
    <div className="space-y-6">
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
            {AVAILABLE_BADGES.slice(0, 6).map((badge) => {
              const IconComponent = getIconComponent(badge.icon)
              const progress = calculateProgress(badge, stats)
              return (
                <TooltipProvider key={badge.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative p-3 rounded-lg border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md hover:shadow-gray-300/50 dark:hover:shadow-gray-700/50 transition-all duration-200 cursor-pointer">
                        {progress.isUnlocked && (
                          <div className="absolute -top-1 -right-1 z-10">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                          </div>
                        )}
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center mx-auto mb-2 ${progress.isUnlocked ? 'shadow-lg shadow-yellow-500/30' : 'opacity-60'}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-xs truncate text-gray-900 dark:text-white">{badge.name}</div>
                          {!progress.isUnlocked && (
                            <div className="mt-1">
                              <Progress value={(progress.progress / progress.maxProgress) * 100} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 dark:text-white">{badge.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{badge.description}</div>
                        {progress.isUnlocked ? (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            Completed!
                          </div>
                        ) : (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {progress.progress}/{progress.maxProgress} ({Math.round((progress.progress / progress.maxProgress) * 100)}%)
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