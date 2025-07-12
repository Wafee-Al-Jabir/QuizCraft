"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Eye, 
  Clock, 
  Shield, 
  Target, 
  Lightbulb, 
  Heart, 
  Star,
  Timer,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSoundEffects } from './sound-effects'

export type PowerUpType = 
  | 'fifty_fifty' 
  | 'extra_time' 
  | 'skip_question' 
  | 'double_points' 
  | 'hint' 
  | 'freeze_time' 
  | 'second_chance'
  | 'reveal_answer'

export interface PowerUp {
  id: string
  type: PowerUpType
  name: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  cooldown?: number // in seconds
  uses?: number // limited uses per quiz
}

const POWER_UPS: Record<PowerUpType, Omit<PowerUp, 'id'>> = {
  fifty_fifty: {
    type: 'fifty_fifty',
    name: '50/50',
    description: 'Remove 2 incorrect answers',
    icon: Target,
    color: 'from-blue-500 to-blue-600',
    rarity: 'common',
    uses: 3
  },
  extra_time: {
    type: 'extra_time',
    name: 'Extra Time',
    description: 'Add 30 seconds to the timer',
    icon: Clock,
    color: 'from-green-500 to-green-600',
    rarity: 'common',
    uses: 2
  },
  skip_question: {
    type: 'skip_question',
    name: 'Skip',
    description: 'Skip this question without penalty',
    icon: Zap,
    color: 'from-yellow-500 to-yellow-600',
    rarity: 'rare',
    uses: 1
  },
  double_points: {
    type: 'double_points',
    name: 'Double Points',
    description: 'Double points for the next correct answer',
    icon: Star,
    color: 'from-purple-500 to-purple-600',
    rarity: 'rare',
    uses: 2
  },
  hint: {
    type: 'hint',
    name: 'Hint',
    description: 'Get a helpful hint for this question',
    icon: Lightbulb,
    color: 'from-orange-500 to-orange-600',
    rarity: 'common',
    uses: 3
  },
  freeze_time: {
    type: 'freeze_time',
    name: 'Freeze Time',
    description: 'Stop the timer for 10 seconds',
    icon: Timer,
    color: 'from-cyan-500 to-cyan-600',
    rarity: 'epic',
    uses: 1
  },
  second_chance: {
    type: 'second_chance',
    name: 'Second Chance',
    description: 'Get another attempt if you answer incorrectly',
    icon: Heart,
    color: 'from-red-500 to-red-600',
    rarity: 'epic',
    uses: 1
  },
  reveal_answer: {
    type: 'reveal_answer',
    name: 'Reveal Answer',
    description: 'Instantly reveal the correct answer',
    icon: Eye,
    color: 'from-pink-500 to-pink-600',
    rarity: 'legendary',
    uses: 1
  }
}

const RARITY_COLORS = {
  common: 'border-gray-300 dark:border-gray-600',
  rare: 'border-blue-400 dark:border-blue-500',
  epic: 'border-purple-400 dark:border-purple-500',
  legendary: 'border-yellow-400 dark:border-yellow-500'
}

const RARITY_GLOWS = {
  common: '',
  rare: 'shadow-blue-500/25',
  epic: 'shadow-purple-500/25',
  legendary: 'shadow-yellow-500/25'
}

interface PowerUpCardProps {
  powerUp: PowerUp
  available: boolean
  cooldownRemaining?: number
  onUse: (powerUpId: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PowerUpCard({ 
  powerUp, 
  available, 
  cooldownRemaining = 0, 
  onUse, 
  className,
  size = 'md'
}: PowerUpCardProps) {
  const { playSound } = useSoundEffects()
  const [isHovered, setIsHovered] = useState(false)
  
  const IconComponent = powerUp.icon
  const isOnCooldown = cooldownRemaining > 0
  const canUse = available && !isOnCooldown
  
  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base'
  }
  
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const handleUse = () => {
    if (canUse) {
      playSound('powerUp')
      onUse(powerUp.id)
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 25, 50])
      }
    }
  }

  return (
    <motion.div
      className={cn(
        'relative rounded-lg border-2 cursor-pointer transition-all duration-200',
        RARITY_COLORS[powerUp.rarity],
        canUse && RARITY_GLOWS[powerUp.rarity],
        canUse ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed',
        sizeClasses[size],
        className
      )}
      whileHover={canUse ? { scale: 1.05, y: -2 } : {}}
      whileTap={canUse ? { scale: 0.95 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleUse}
    >
      {/* Background gradient */}
      <div className={cn(
        'absolute inset-0 rounded-lg bg-gradient-to-br opacity-10',
        powerUp.color
      )} />
      
      {/* Cooldown overlay */}
      {isOnCooldown && (
        <motion.div
          className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-white font-bold">
            {cooldownRemaining}s
          </div>
        </motion.div>
      )}
      
      <div className="relative z-10 flex flex-col items-center space-y-2">
        {/* Icon */}
        <motion.div
          animate={{
            rotate: isHovered && canUse ? [0, -10, 10, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <IconComponent 
            size={iconSizes[size]} 
            className={cn(
              'text-gray-700 dark:text-gray-300',
              canUse && 'text-gray-900 dark:text-white'
            )}
          />
        </motion.div>
        
        {/* Name */}
        <div className="font-semibold text-center leading-tight">
          {powerUp.name}
        </div>
        
        {/* Uses remaining */}
        {powerUp.uses && (
          <Badge variant="secondary" className="text-xs">
            {powerUp.uses} uses
          </Badge>
        )}
        
        {/* Rarity indicator */}
        <div className={cn(
          'w-2 h-2 rounded-full',
          powerUp.rarity === 'common' && 'bg-gray-400',
          powerUp.rarity === 'rare' && 'bg-blue-400',
          powerUp.rarity === 'epic' && 'bg-purple-400',
          powerUp.rarity === 'legendary' && 'bg-yellow-400'
        )} />
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20"
          >
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
              {powerUp.description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Power-up inventory component
interface PowerUpInventoryProps {
  powerUps: PowerUp[]
  onUsePowerUp: (powerUpId: string) => void
  className?: string
}

export function PowerUpInventory({ powerUps, onUsePowerUp, className }: PowerUpInventoryProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center space-x-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold">Power-ups</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {powerUps.map((powerUp) => (
          <PowerUpCard
            key={powerUp.id}
            powerUp={powerUp}
            available={true}
            onUse={onUsePowerUp}
            size="sm"
          />
        ))}
      </div>
    </div>
  )
}

// Power-up shop component
interface PowerUpShopProps {
  availablePowerUps: PowerUpType[]
  playerCoins: number
  onPurchase: (powerUpType: PowerUpType, cost: number) => void
  className?: string
}

const POWER_UP_COSTS: Record<PowerUpType, number> = {
  fifty_fifty: 10,
  extra_time: 15,
  skip_question: 25,
  double_points: 30,
  hint: 12,
  freeze_time: 50,
  second_chance: 75,
  reveal_answer: 100
}

export function PowerUpShop({ availablePowerUps, playerCoins, onPurchase, className }: PowerUpShopProps) {
  const { playSound } = useSoundEffects()
  
  const handlePurchase = (powerUpType: PowerUpType) => {
    const cost = POWER_UP_COSTS[powerUpType]
    if (playerCoins >= cost) {
      playSound('achievement')
      onPurchase(powerUpType, cost)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Power-up Shop</h3>
        <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
          <Star className="w-4 h-4" />
          <span className="font-medium">{playerCoins} coins</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availablePowerUps.map((powerUpType) => {
          const powerUpData = POWER_UPS[powerUpType]
          const cost = POWER_UP_COSTS[powerUpType]
          const canAfford = playerCoins >= cost
          const IconComponent = powerUpData.icon
          
          return (
            <motion.div
              key={powerUpType}
              className={cn(
                'p-4 rounded-lg border-2 cursor-pointer transition-all',
                RARITY_COLORS[powerUpData.rarity],
                canAfford ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
              )}
              whileHover={canAfford ? { scale: 1.02 } : {}}
              whileTap={canAfford ? { scale: 0.98 } : {}}
              onClick={() => handlePurchase(powerUpType)}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  'p-2 rounded-lg bg-gradient-to-br',
                  powerUpData.color
                )}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{powerUpData.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {powerUpData.rarity}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {powerUpData.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                      <Star className="w-3 h-3" />
                      <span className="text-sm font-medium">{cost}</span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      disabled={!canAfford}
                      className="text-xs"
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Hook for managing power-ups
export function usePowerUps() {
  const [inventory, setInventory] = useState<PowerUp[]>([])
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})
  
  const addPowerUp = (type: PowerUpType) => {
    const powerUpData = POWER_UPS[type]
    const newPowerUp: PowerUp = {
      ...powerUpData,
      id: `${type}_${Date.now()}`
    }
    setInventory(prev => [...prev, newPowerUp])
  }
  
  const usePowerUp = (powerUpId: string) => {
    const powerUp = inventory.find(p => p.id === powerUpId)
    if (!powerUp) return false
    
    // Remove from inventory or decrease uses
    setInventory(prev => {
      if (powerUp.uses && powerUp.uses > 1) {
        return prev.map(p => 
          p.id === powerUpId 
            ? { ...p, uses: p.uses! - 1 }
            : p
        )
      } else {
        return prev.filter(p => p.id !== powerUpId)
      }
    })
    
    // Set cooldown if applicable
    if (powerUp.cooldown) {
      setCooldowns(prev => ({ ...prev, [powerUpId]: powerUp.cooldown! }))
      
      // Countdown
      const interval = setInterval(() => {
        setCooldowns(prev => {
          const remaining = prev[powerUpId] - 1
          if (remaining <= 0) {
            clearInterval(interval)
            const { [powerUpId]: _, ...rest } = prev
            return rest
          }
          return { ...prev, [powerUpId]: remaining }
        })
      }, 1000)
    }
    
    return true
  }
  
  return {
    inventory,
    cooldowns,
    addPowerUp,
    usePowerUp
  }
}