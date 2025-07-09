"use client"

import React from "react"
import { motion } from "framer-motion"
import { Trophy, Star, Zap, Users, Target, Rocket, Globe, Award, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge as BadgeUI } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"
import type { Badge } from "@/lib/types"

interface BadgeNotificationProps {
  badge: Badge
  onClose?: () => void
}

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
    case 'common':
      return 'from-gray-400 to-gray-600'
    case 'rare':
      return 'from-blue-400 to-blue-600'
    case 'epic':
      return 'from-purple-400 to-purple-600'
    case 'legendary':
      return 'from-yellow-400 to-yellow-600'
    default:
      return 'from-gray-400 to-gray-600'
  }
}

function getRarityGlow(rarity: string) {
  switch (rarity) {
    case 'common':
      return 'shadow-gray-500/20'
    case 'rare':
      return 'shadow-blue-500/30'
    case 'epic':
      return 'shadow-purple-500/40'
    case 'legendary':
      return 'shadow-yellow-500/50'
    default:
      return 'shadow-gray-500/20'
  }
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const IconComponent = getIconComponent(badge.icon)
  const rarityColor = getRarityColor(badge.rarity)
  const rarityGlow = getRarityGlow(badge.rarity)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      className="flex items-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
    >
      {/* Badge Icon with Glow Effect */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={`relative p-3 rounded-full bg-gradient-to-br ${rarityColor} ${rarityGlow} shadow-lg`}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <IconComponent className="h-6 w-6 text-white" />
        </motion.div>
        
        {/* Sparkle Effect for Legendary */}
        {badge.rarity === 'legendary' && (
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Star className="h-3 w-3 text-yellow-300" fill="currentColor" />
          </motion.div>
        )}
      </motion.div>

      {/* Badge Info */}
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              🎉 Badge Unlocked!
            </h3>
            <BadgeUI 
              variant="secondary" 
              className={`text-xs capitalize bg-gradient-to-r ${rarityColor} text-white border-0`}
            >
              {badge.rarity}
            </BadgeUI>
          </div>
          <p className="font-medium text-gray-800 dark:text-gray-200">
            {badge.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {badge.description}
          </p>
        </motion.div>
      </div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          asChild
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Link href="/badges" className="flex items-center gap-2">
            View Achievements
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  )
}

// Function to show badge notification
export function showBadgeNotification(badge: Badge) {
  const IconComponent = getIconComponent(badge.icon)
  const rarityColor = getRarityColor(badge.rarity)
  
  toast.custom(
    (t) => (
      <BadgeNotification 
        badge={badge} 
        onClose={() => toast.dismiss(t)}
      />
    ),
    {
      duration: 6000,
      position: 'top-right',
    }
  )
}

// Hook to check for new badges and show notifications
export function useBadgeNotifications() {
  const checkForNewBadges = (previousStats: any, currentStats: any, availableBadges: Badge[]) => {
    const newlyUnlockedBadges: Badge[] = []
    
    availableBadges.forEach(badge => {
      const wasUnlocked = checkBadgeUnlocked(badge, previousStats)
      const isNowUnlocked = checkBadgeUnlocked(badge, currentStats)
      
      if (!wasUnlocked && isNowUnlocked) {
        newlyUnlockedBadges.push(badge)
      }
    })
    
    // Show notifications for newly unlocked badges
    newlyUnlockedBadges.forEach((badge, index) => {
      setTimeout(() => {
        showBadgeNotification(badge)
      }, index * 1000) // Stagger notifications by 1 second
    })
    
    return newlyUnlockedBadges
  }
  
  return { checkForNewBadges }
}

// Helper function to check if a badge is unlocked
function checkBadgeUnlocked(badge: Badge, stats: any): boolean {
  const requirement = badge.requirement
  let progress = 0
  
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
      progress = stats.perfectScores || 0
      break
    case "speed":
      progress = stats.fastCompletions || 0
      break
    case "streak":
      progress = stats.currentStreak || 0
      break
    case "exploration":
      progress = stats.categoriesExplored || 0
      break
    default:
      progress = 0
  }
  
  return progress >= requirement.value
}