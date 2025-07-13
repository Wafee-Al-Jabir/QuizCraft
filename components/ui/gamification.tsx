"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Trophy, Zap, Crown, Gift, Target, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useSoundEffects } from "@/components/ui/sound-effects"
import { Celebration } from "@/components/ui/celebration"

interface UserProgress {
  level: number
  xp: number
  totalXp: number
  streak: number
  achievements: string[]
  badges: string[]
  coins: number
}

interface XPGain {
  amount: number
  reason: string
  timestamp: number
}

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000,
  13000, 16500, 20500, 25000, 30000, 35500, 41500, 48000, 55000, 62500
]

const LEVEL_TITLES = [
  'Novice', 'Apprentice', 'Scholar', 'Expert', 'Master', 'Sage',
  'Virtuoso', 'Champion', 'Legend', 'Grandmaster', 'Mythic',
  'Transcendent', 'Omniscient', 'Cosmic', 'Eternal', 'Divine',
  'Celestial', 'Infinite', 'Ultimate', 'Supreme', 'Godlike'
]

const XP_REWARDS = {
  correctAnswer: 10,
  perfectQuiz: 50,
  fastAnswer: 5,
  streak5: 25,
  streak10: 50,
  streak25: 100,
  firstQuiz: 20,
  dailyLogin: 5,
  achievement: 30
}

export function useGamification() {
  const [progress, setProgress] = useState<UserProgress>({
    level: 1,
    xp: 0,
    totalXp: 0,
    streak: 0,
    achievements: [],
    badges: [],
    coins: 0
  })
  const [recentXpGains, setRecentXpGains] = useState<XPGain[]>([])
  const [showLevelUp, setShowLevelUp] = useState(false)
  const { playSound } = useSoundEffects()

  const calculateLevel = (totalXp: number) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalXp >= LEVEL_THRESHOLDS[i]) {
        return i + 1
      }
    }
    return 1
  }

  const getXpForNextLevel = (level: number) => {
    return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  }

  const getCurrentLevelXp = (level: number) => {
    return LEVEL_THRESHOLDS[level - 1] || 0
  }

  const addXp = (amount: number, reason: string) => {
    setProgress(prev => {
      const newTotalXp = prev.totalXp + amount
      const newLevel = calculateLevel(newTotalXp)
      const currentLevelXp = getCurrentLevelXp(newLevel)
      const newXp = newTotalXp - currentLevelXp
      
      // Check for level up
      if (newLevel > prev.level) {
        setShowLevelUp(true)
        playSound('levelUp')
        setTimeout(() => setShowLevelUp(false), 3000)
      } else {
        playSound('correct')
      }
      
      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        totalXp: newTotalXp,
        coins: prev.coins + Math.floor(amount / 2)
      }
    })
    
    // Add to recent gains
    setRecentXpGains(prev => [
      { amount, reason, timestamp: Date.now() },
      ...prev.slice(0, 4)
    ])
    
    // Remove after animation
    setTimeout(() => {
      setRecentXpGains(prev => prev.filter(gain => 
        Date.now() - gain.timestamp < 3000
      ))
    }, 3000)
  }

  const addAchievement = (achievementId: string) => {
    setProgress(prev => {
      if (!prev.achievements.includes(achievementId)) {
        playSound('achievement')
        return {
          ...prev,
          achievements: [...prev.achievements, achievementId]
        }
      }
      return prev
    })
  }

  const updateStreak = (newStreak: number) => {
    setProgress(prev => ({ ...prev, streak: newStreak }))
    
    // Streak rewards
    if (newStreak === 5) addXp(XP_REWARDS.streak5, 'Streak x5!')
    if (newStreak === 10) addXp(XP_REWARDS.streak10, 'Streak x10!')
    if (newStreak === 25) addXp(XP_REWARDS.streak25, 'Streak x25!')
  }

  return {
    progress,
    addXp,
    addAchievement,
    updateStreak,
    recentXpGains,
    showLevelUp,
    getXpForNextLevel,
    getCurrentLevelXp,
    XP_REWARDS
  }
}

export function LevelDisplay({ progress }: { progress: UserProgress }) {
  const nextLevelXp = LEVEL_THRESHOLDS[progress.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const currentLevelXp = LEVEL_THRESHOLDS[progress.level - 1] || 0
  const xpProgress = ((progress.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
  
  return (
    <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-yellow-300" />
            <div>
              <div className="text-lg font-bold">Level {progress.level}</div>
              <div className="text-sm opacity-80">{LEVEL_TITLES[progress.level - 1] || 'Master'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">XP</div>
            <div className="font-bold">{progress.totalXp.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Level {progress.level + 1}</span>
            <span>{Math.round(xpProgress)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function XpGainAnimation({ gains }: { gains: XPGain[] }) {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {gains.map((gain, index) => (
          <motion.div
            key={gain.timestamp}
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2"
          >
            <Star className="h-4 w-4" />
            <span className="font-bold">+{gain.amount} XP</span>
            <span className="text-sm opacity-80">{gain.reason}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function LevelUpModal({ show, level }: { show: boolean; level: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative"
          >
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-2xl">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="mb-4"
                >
                  <Crown className="h-16 w-16 mx-auto text-yellow-200" />
                </motion.div>
                
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold mb-2"
                >
                  LEVEL UP!
                </motion.h2>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl mb-4"
                >
                  You reached Level {level}!
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg opacity-90"
                >
                  {LEVEL_TITLES[level - 1] || 'Master'}
                </motion.div>
              </CardContent>
            </Card>
            
            <Celebration show={true} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function StatsOverview({ progress }: { progress: UserProgress }) {
  const stats = [
    {
      icon: <Crown className="h-5 w-5" />,
      label: 'Level',
      value: progress.level,
      color: 'text-yellow-500'
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: 'Total XP',
      value: progress.totalXp.toLocaleString(),
      color: 'text-blue-500'
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: 'Streak',
      value: progress.streak,
      color: 'text-orange-500'
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: 'Achievements',
      value: progress.achievements.length,
      color: 'text-purple-500'
    },
    {
      icon: <Gift className="h-5 w-5" />,
      label: 'Coins',
      value: progress.coins,
      color: 'text-green-500'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className={`${stat.color} mb-2 flex justify-center`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export function DailyChallenge() {
  const [completed, setCompleted] = useState(false)
  const { addXp } = useGamification()

  const challenges = [
    { id: 'quiz5', title: 'Complete 5 Quizzes', reward: 50, progress: 3, target: 5 },
    { id: 'streak', title: 'Get 10 Streak', reward: 30, progress: 7, target: 10 },
    { id: 'perfect', title: 'Perfect Score', reward: 75, progress: 0, target: 1 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-orange-500" />
          <span>Daily Challenges</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{challenge.title}</span>
              <Badge variant="outline" className="text-orange-500">
                +{challenge.reward} XP
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{challenge.progress}/{challenge.target}</span>
              </div>
              <Progress 
                value={(challenge.progress / challenge.target) * 100} 
                className="h-2"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function GamificationDashboard() {
  const { progress, recentXpGains, showLevelUp } = useGamification()

  return (
    <div className="space-y-6">
      <LevelDisplay progress={progress} />
      <StatsOverview progress={progress} />
      <DailyChallenge />
      <XpGainAnimation gains={recentXpGains} />
      <LevelUpModal show={showLevelUp} level={progress.level} />
    </div>
  )
}