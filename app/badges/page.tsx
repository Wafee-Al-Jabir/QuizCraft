import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as BadgeUI } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Trophy, Star, Zap, Users, Target, Rocket, Globe, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getCurrentUserServer } from "@/lib/auth-server"
import { getQuizStats } from "@/lib/quiz-actions"
import type { Badge, UserBadge, User } from "@/lib/types"

// Badge definitions ordered by rarity: common -> rare -> epic -> legendary
const AVAILABLE_BADGES: Badge[] = [
  // Common badges
  {
    id: "first-quiz",
    name: "Quiz Creator",
    description: "Create your first quiz",
    icon: "trophy",
    rarity: "common",
    color: "from-blue-500 to-blue-600",
    type: "achievement",
    requirement: { type: "quiz_count", value: 1 }
  },
  {
    id: "prolific-publisher",
    name: "Prolific Publisher",
    description: "Publish 5 quizzes",
    icon: "rocket",
    rarity: "common",
    color: "from-indigo-500 to-indigo-600",
    type: "achievement",
    requirement: { type: "quiz_count", value: 5 }
  },
  {
    id: "question-writer",
    name: "Question Writer",
    description: "Write 50 questions",
    icon: "zap",
    rarity: "common",
    color: "from-yellow-500 to-yellow-600",
    type: "achievement",
    requirement: { type: "question_count", value: 50 }
  },
  // Rare badges
  {
    id: "quiz-master",
    name: "Quiz Master",
    description: "Create 10 quizzes",
    icon: "star",
    rarity: "rare",
    color: "from-purple-500 to-purple-600",
    type: "achievement",
    requirement: { type: "quiz_count", value: 10 }
  },
  {
    id: "popular-creator",
    name: "Popular Creator",
    description: "Get 100 total participants",
    icon: "users",
    rarity: "rare",
    color: "from-green-500 to-green-600",
    type: "achievement",
    requirement: { type: "participant_count", value: 100 }
  },
  // Epic badges
  {
    id: "engagement-expert",
    name: "Engagement Expert",
    description: "Achieve 80% average score",
    icon: "target",
    rarity: "epic",
    color: "from-red-500 to-red-600",
    type: "achievement",
    requirement: { type: "perfect_score", value: 80 }
  },
  // Legendary badges
  {
    id: "quiz-legend",
    name: "Quiz Legend",
    description: "Create 25 quizzes",
    icon: "award",
    rarity: "legendary",
    color: "from-orange-500 to-orange-600",
    type: "achievement",
    requirement: { type: "quiz_count", value: 25 }
  },
  {
    id: "global-reach",
    name: "Global Reach",
    description: "Get 500 total participants",
    icon: "globe",
    rarity: "legendary",
    color: "from-pink-500 to-pink-600",
    type: "achievement",
    requirement: { type: "participant_count", value: 500 }
  },
  // First Place Badges
  {
    id: "first-victory",
    name: "First Victory",
    description: "Achieve 1st place in any quiz",
    icon: "trophy",
    rarity: "common",
    color: "from-yellow-500 to-yellow-600",
    type: "achievement",
    requirement: { type: "first_place_count", value: 1 }
  },
  {
    id: "podium-regular",
    name: "Podium Regular",
    description: "Finish 1st place 5 times",
    icon: "award",
    rarity: "rare",
    color: "from-orange-500 to-orange-600",
    type: "achievement",
    requirement: { type: "first_place_count", value: 5 }
  },
  {
    id: "champion",
    name: "Champion",
    description: "Achieve 1st place 10 times",
    icon: "star",
    rarity: "epic",
    color: "from-purple-500 to-purple-600",
    type: "achievement",
    requirement: { type: "first_place_count", value: 10 }
  },
  {
    id: "quiz-dominator",
    name: "Quiz Dominator",
    description: "Win 1st place 25 times",
    icon: "trophy",
    rarity: "legendary",
    color: "from-red-500 to-red-600",
    type: "achievement",
    requirement: { type: "first_place_count", value: 25 }
  },
  {
    id: "speed-champion",
    name: "Speed Champion",
    description: "Win 1st place with fastest time",
    icon: "zap",
    rarity: "epic",
    color: "from-cyan-500 to-cyan-600",
    type: "achievement",
    requirement: { type: "speed_first_place", value: 1 }
  },
  {
    id: "perfect-champion",
    name: "Perfect Champion",
    description: "Win 1st place with 100% accuracy",
    icon: "target",
    rarity: "epic",
    color: "from-green-500 to-green-600",
    type: "achievement",
    requirement: { type: "perfect_first_place", value: 1 }
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Win 1st place 3 times in a row",
    icon: "star",
    rarity: "rare",
    color: "from-indigo-500 to-indigo-600",
    type: "achievement",
    requirement: { type: "first_place_streak", value: 3 }
  },
  {
    id: "ultimate-champion",
    name: "Ultimate Champion",
    description: "Win 1st place 50 times",
    icon: "award",
    rarity: "legendary",
    color: "from-gradient-to-r from-yellow-400 via-red-500 to-pink-500",
    type: "achievement",
    requirement: { type: "first_place_count", value: 50 }
  },
  // Ultimate badges - The highest tier achievements
  {
    id: "quiz-god",
    name: "Quiz God",
    description: "Create 100 quizzes - The ultimate creator",
    icon: "award",
    rarity: "ultimate",
    color: "from-red-500 to-red-700",
    type: "achievement",
    requirement: { type: "quiz_count", value: 100 }
  },
  {
    id: "question-architect",
    name: "Question Architect",
    description: "Write 1000 questions - Master of knowledge",
    icon: "zap",
    rarity: "ultimate",
    color: "from-red-600 to-red-800",
    type: "achievement",
    requirement: { type: "question_count", value: 1000 }
  },
  {
    id: "global-phenomenon",
    name: "Global Phenomenon",
    description: "Reach 10,000 total participants across all quizzes",
    icon: "globe",
    rarity: "ultimate",
    color: "from-red-400 to-red-600",
    type: "achievement",
    requirement: { type: "participant_count", value: 10000 }
  },
  {
    id: "perfectionist-supreme",
    name: "Perfectionist Supreme",
    description: "Maintain 100% average score with 50+ participants",
    icon: "target",
    rarity: "ultimate",
    color: "from-red-500 to-red-700",
    type: "achievement",
    requirement: { type: "perfect_score", value: 100 }
  },
  {
    id: "ultimate-champion-supreme",
    name: "Ultimate Champion Supreme",
    description: "Win 1st place 100 times - Unbeatable",
    icon: "trophy",
    rarity: "ultimate",
    color: "from-red-600 to-red-800",
    type: "achievement",
    requirement: { type: "first_place_count", value: 100 }
  },
  {
    id: "speed-legend",
    name: "Speed Legend",
    description: "Win 1st place with fastest time 25 times",
    icon: "zap",
    rarity: "ultimate",
    color: "from-red-400 to-red-600",
    type: "achievement",
    requirement: { type: "speed_first_place", value: 25 }
  },
  {
    id: "perfect-dominator",
    name: "Perfect Dominator",
    description: "Win 1st place with perfect score 50 times",
    icon: "star",
    rarity: "ultimate",
    color: "from-red-500 to-red-700",
    type: "achievement",
    requirement: { type: "perfect_first_place", value: 50 }
  },
  {
    id: "unstoppable-force",
    name: "Unstoppable Force",
    description: "Maintain a 50-win streak - Truly unstoppable",
    icon: "award",
    rarity: "ultimate",
    color: "from-red-600 to-red-800",
    type: "achievement",
    requirement: { type: "first_place_streak", value: 50 }
  }
]

function getIconComponent(iconName: string) {
  const icons = {
    trophy: Trophy,
    star: Star,
    zap: Zap,
    users: Users,
    target: Target,
    rocket: Rocket,
    globe: Globe,
    award: Award
  }
  return icons[iconName as keyof typeof icons] || Trophy
}

function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'common': return 'border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white'
    case 'rare': return 'border-blue-300 bg-blue-100 text-blue-900 dark:border-blue-600 dark:bg-blue-900 dark:text-white'
    case 'epic': return 'border-purple-300 bg-purple-100 text-purple-900 dark:border-purple-600 dark:bg-purple-900 dark:text-white'
    case 'legendary': return 'border-yellow-300 bg-yellow-100 text-yellow-900 dark:border-yellow-600 dark:bg-yellow-900 dark:text-white'
    case 'ultimate': return 'border-red-300 bg-red-100 text-red-900 dark:border-red-600 dark:bg-red-900 dark:text-white'
    default: return 'border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white'
  }
}

function calculateProgress(badge: Badge, stats: any) {
  const requirement = badge.requirement
  let progress = 0
  let maxProgress = requirement.value
  let isUnlocked = false

  switch (requirement.type) {
    case "quiz_count":
      progress = stats.totalQuizzes || 0
      break
    case "question_count":
      progress = stats.totalQuestions || 0
      break
    case "participant_count":
      progress = stats.totalParticipants || 0
      break
    case "perfect_score":
      progress = Math.round(stats.averageScore || 0)
      break
    case "speed":
      progress = stats.averageSpeed || 0
      break
    case "streak":
      progress = stats.currentStreak || 0
      break
    case "exploration":
      progress = stats.categoriesExplored || 0
      break
    case "first_place_count":
      progress = stats.firstPlaceWins || 0
      break
    case "speed_first_place":
      progress = stats.speedFirstPlace || 0
      break
    case "perfect_first_place":
      progress = stats.perfectFirstPlace || 0
      break
    case "first_place_streak":
      progress = stats.firstPlaceStreak || 0
      break
    default:
      progress = 0
      break
  }

  isUnlocked = progress >= maxProgress
  return { progress, maxProgress, isUnlocked }
}

export default async function BadgesPage() {
  const user = await getCurrentUserServer()
  
  if (!user) {
    redirect("/auth/signin")
  }

  const userStats = await getQuizStats(user.id)

  // Calculate badge progress for all available badges
  const badgesWithProgress = AVAILABLE_BADGES.map(badge => {
    const progress = calculateProgress(badge, userStats)
    return {
      ...badge,
      ...progress
    }
  })

  const unlockedBadges = badgesWithProgress.filter(badge => badge.isUnlocked)
  const inProgressBadges = badgesWithProgress.filter(badge => !badge.isUnlocked && badge.progress > 0)
  const lockedBadges = badgesWithProgress.filter(badge => !badge.isUnlocked && badge.progress === 0)

  // Sort badges by rarity order: common -> rare -> epic -> legendary -> ultimate
  const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, ultimate: 5 }
  const sortedBadges = badgesWithProgress.sort((a, b) => {
    return rarityOrder[a.rarity as keyof typeof rarityOrder] - rarityOrder[b.rarity as keyof typeof rarityOrder]
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Achievement Badges
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track your progress and unlock amazing achievements!
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {unlockedBadges.length}/{AVAILABLE_BADGES.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Badges Unlocked
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-black border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Trophy className="h-6 w-6 text-purple-400" />
              <span>Your Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{unlockedBadges.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Unlocked</div>
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
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((unlockedBadges.length / AVAILABLE_BADGES.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Complete</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={(unlockedBadges.length / AVAILABLE_BADGES.length) * 100} 
                className="h-3" 
              />
            </div>
          </CardContent>
        </Card>

        {/* All Badges Grid */}
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Award className="h-6 w-6 text-yellow-400" />
              <span>All Badges</span>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Complete challenges to unlock these achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedBadges.map((badge) => {
                const IconComponent = getIconComponent(badge.icon)
                const progressPercentage = badge.maxProgress > 0 ? (badge.progress / badge.maxProgress) * 100 : 0
                
                return (
                  <TooltipProvider key={badge.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                          badge.isUnlocked 
                            ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-800 dark:to-gray-900 border-yellow-500 shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40' 
                            : badge.progress > 0
                            ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 border-blue-500 hover:shadow-md hover:shadow-blue-500/30'
                            : 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 opacity-75 hover:opacity-90'
                        }`}>
                          {/* Star for completed badges */}
                          {badge.isUnlocked && (
                            <div className="absolute -top-2 -right-2 z-10">
                              <div className="bg-yellow-500 rounded-full p-2 shadow-lg">
                                <Star className="h-4 w-4 text-white fill-white" />
                              </div>
                            </div>
                          )}
                          
                          {/* Badge Icon */}
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center mx-auto mb-4 shadow-lg ${
                            badge.isUnlocked ? 'shadow-xl' : badge.progress > 0 ? 'shadow-md' : 'opacity-60'
                          }`}>
                            <IconComponent className="h-8 w-8 text-white" />
                          </div>
                          
                          {/* Badge Info */}
                          <div className="text-center mb-4">
                            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{badge.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{badge.description}</p>
                            <BadgeUI 
                              variant={badge.isUnlocked ? "default" : "secondary"} 
                              className={`text-xs border ${
                                badge.rarity === 'ultimate' ? 'bg-red-600 border-red-500 text-white' :
                                badge.rarity === 'legendary' ? 'bg-yellow-600 border-yellow-500 text-white' :
                                badge.rarity === 'epic' ? 'bg-purple-600 border-purple-500 text-white' :
                                badge.rarity === 'rare' ? 'bg-blue-600 border-blue-500 text-white' :
                                'bg-gray-600 border-gray-500 text-white'
                              }`}
                            >
                              {badge.rarity.toUpperCase()}
                            </BadgeUI>
                          </div>
                          
                          {/* Progress */}
                          {badge.isUnlocked ? (
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 text-green-400 font-semibold">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>Completed!</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-gray-300">
                                <span>{badge.progress} / {badge.maxProgress}</span>
                                <span>{Math.round(progressPercentage)}%</span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 border-gray-700">
                        <div className="text-center max-w-xs">
                          <div className="font-semibold text-white">{badge.name}</div>
                          <div className="text-sm text-gray-300 mb-2">{badge.description}</div>
                          <div className="text-xs">
                            {badge.isUnlocked ? (
                              <span className="text-green-400 font-semibold">✓ Achievement Unlocked!</span>
                            ) : (
                              <span className="text-blue-400">
                                Progress: {badge.progress}/{badge.maxProgress} ({Math.round(progressPercentage)}%)
                              </span>
                            )}
                          </div>
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
    </div>
  )
}