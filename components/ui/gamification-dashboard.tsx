"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Star, Zap, Target, Award, TrendingUp, Crown, Medal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface UserStats {
  level: number
  xp: number
  xpToNextLevel: number
  totalQuizzes: number
  correctAnswers: number
  streak: number
  badges: number
  rank: string
  achievements: Achievement[]
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
}

interface GamificationDashboardProps {
  userStats: UserStats
  className?: string
}

export function GamificationDashboard({ userStats, className = "" }: GamificationDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview')
  
  const xpProgress = (userStats.xp / userStats.xpToNextLevel) * 100
  const accuracy = userStats.totalQuizzes > 0 ? (userStats.correctAnswers / userStats.totalQuizzes) * 100 : 0

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      star: Star,
      zap: Zap,
      target: Target,
      award: Award,
      crown: Crown,
      medal: Medal
    }
    const IconComponent = icons[iconName] || Trophy
    return <IconComponent className="h-5 w-5" />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{userStats.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">XP</p>
                <p className="text-2xl font-bold">{userStats.xp}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{userStats.streak}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Medal className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Badges</p>
                <p className="text-2xl font-bold">{userStats.badges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Level Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {userStats.level}</span>
              <span>{userStats.xp} / {userStats.xpToNextLevel} XP</span>
            </div>
            <Progress value={xpProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {userStats.xpToNextLevel - userStats.xp} XP to next level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {(['overview', 'achievements', 'leaderboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Accuracy</span>
                        <span>{accuracy.toFixed(1)}%</span>
                      </div>
                      <Progress value={accuracy} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{userStats.correctAnswers}</p>
                        <p className="text-xs text-muted-foreground">Correct</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{userStats.totalQuizzes}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Rank</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {userStats.rank}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Keep playing to improve your rank!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
        
        {selectedTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userStats.achievements.map((achievement) => (
                <Card key={achievement.id} className={achievement.unlocked ? 'border-green-200' : 'opacity-60'}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        achievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {getIconComponent(achievement.icon)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {!achievement.unlocked && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.maxProgress) * 100} 
                              className="h-1" 
                            />
                          </div>
                        )}
                      </div>
                      {achievement.unlocked && (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
        
        {selectedTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Global Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Leaderboard feature coming soon!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GamificationDashboard