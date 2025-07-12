"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AchievementNotificationProps {
  show: boolean
  achievement: {
    id: string
    name: string
    description: string
    type: 'streak' | 'score' | 'participation' | 'special'
    icon?: string
  } | null
  onClose: () => void
  onGoToAchievements: () => void
}

export function AchievementNotification({ 
  show, 
  achievement, 
  onClose, 
  onGoToAchievements 
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (show && achievement) {
      setIsVisible(true)
      setIsAnimating(true)
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)
      
      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [show, achievement])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }

  const handleGoToAchievements = () => {
    handleClose()
    onGoToAchievements()
  }

  if (!isVisible || !achievement) return null

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'streak': return 'from-orange-500 to-red-500'
      case 'score': return 'from-blue-500 to-purple-500'
      case 'participation': return 'from-green-500 to-teal-500'
      case 'special': return 'from-yellow-500 to-orange-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'streak': return '🔥'
      case 'score': return '🏆'
      case 'participation': return '🎯'
      case 'special': return '⭐'
      default: return '🏅'
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex justify-center p-4">
        <Card 
          className={cn(
            "pointer-events-auto max-w-md w-full shadow-2xl border-0 overflow-hidden",
            "transform transition-all duration-300 ease-out",
            isAnimating 
              ? "translate-y-0 opacity-100 scale-100" 
              : "-translate-y-full opacity-0 scale-95"
          )}
        >
          <div className={cn(
            "h-2 bg-gradient-to-r",
            getAchievementColor(achievement.type)
          )} />
          
          <CardContent className="p-4 bg-gradient-to-br from-gray-900 to-black text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-2xl">
                  {achievement.icon || getAchievementIcon(achievement.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500 uppercase tracking-wide">
                      Achievement Unlocked!
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-white mb-1 truncate">
                    {achievement.name}
                  </h3>
                  
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs bg-gradient-to-r text-white border-0",
                        getAchievementColor(achievement.type)
                      )}
                    >
                      {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button
                onClick={handleGoToAchievements}
                size="sm"
                className={cn(
                  "flex-1 bg-gradient-to-r text-white border-0 hover:opacity-90",
                  getAchievementColor(achievement.type)
                )}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Achievements
              </Button>
              
              <Button
                onClick={handleClose}
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-600 hover:bg-gray-800 hover:text-white"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Hook for managing achievement notifications
export function useAchievementNotification() {
  const [notification, setNotification] = useState<{
    show: boolean
    achievement: {
      id: string
      name: string
      description: string
      type: 'streak' | 'score' | 'participation' | 'special'
      icon?: string
    } | null
  }>({ show: false, achievement: null })

  const showAchievement = (achievement: {
    id: string
    name: string
    description: string
    type: 'streak' | 'score' | 'participation' | 'special'
    icon?: string
  }) => {
    setNotification({ show: true, achievement })
  }

  const hideAchievement = () => {
    setNotification({ show: false, achievement: null })
  }

  return {
    notification,
    showAchievement,
    hideAchievement
  }
}