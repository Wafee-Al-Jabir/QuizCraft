"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  Calendar,
  Filter,
  Search,
  Award,
  Zap,
  Target,
  Clock,
  Flame,
  ChevronUp,
  ChevronDown,
  User,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSoundEffects } from './sound-effects'

export interface LeaderboardEntry {
  id: string
  username: string
  avatar?: string
  score: number
  rank: number
  previousRank?: number
  streak: number
  accuracy: number
  totalQuizzes: number
  averageTime: number
  badges: string[]
  isOnline: boolean
  lastActive: Date
  country?: string
  level: number
  experience: number
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime'
export type LeaderboardCategory = 'score' | 'streak' | 'accuracy' | 'speed'

const PERIOD_LABELS = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
  allTime: 'All Time'
}

const CATEGORY_LABELS = {
  score: 'Total Score',
  streak: 'Best Streak',
  accuracy: 'Accuracy',
  speed: 'Speed'
}

const CATEGORY_ICONS = {
  score: Star,
  streak: Flame,
  accuracy: Target,
  speed: Zap
}

interface LeaderboardEntryCardProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
  showDetails?: boolean
  onUserClick?: (userId: string) => void
  className?: string
}

export function LeaderboardEntryCard({ 
  entry, 
  isCurrentUser = false, 
  showDetails = true,
  onUserClick,
  className 
}: LeaderboardEntryCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { playSound } = useSoundEffects()
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />
      case 2: return <Medal className="w-6 h-6 text-gray-400" />
      case 3: return <Trophy className="w-6 h-6 text-amber-600" />
      default: return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>
    }
  }
  
  const getRankChange = () => {
    if (!entry.previousRank) return null
    
    const change = entry.previousRank - entry.rank
    if (change > 0) {
      return (
        <div className="flex items-center text-green-500 text-sm">
          <ChevronUp className="w-4 h-4" />
          <span>+{change}</span>
        </div>
      )
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-500 text-sm">
          <ChevronDown className="w-4 h-4" />
          <span>{change}</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center text-gray-500 text-sm">
          <Minus className="w-4 h-4" />
        </div>
      )
    }
  }
  
  const handleClick = () => {
    if (onUserClick) {
      playSound('click')
      onUserClick(entry.id)
    }
  }

  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-lg border transition-all duration-200 cursor-pointer',
        isCurrentUser 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        entry.rank <= 3 && 'ring-2 ring-yellow-200 dark:ring-yellow-800',
        className
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      layout
    >
      {/* Rank background for top 3 */}
      {entry.rank <= 3 && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-lg opacity-50" />
      )}
      
      <div className="relative z-10 flex items-center space-x-4">
        {/* Rank */}
        <div className="flex flex-col items-center space-y-1">
          {getRankIcon(entry.rank)}
          {getRankChange()}
        </div>
        
        {/* Avatar and user info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={entry.avatar} alt={entry.username} />
              <AvatarFallback>
                {entry.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Online indicator */}
            {entry.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            )}
            
            {/* Country flag */}
            {entry.country && (
              <div className="absolute -top-1 -right-1 text-xs">
                🌍
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className={cn(
                'font-bold truncate text-lg',
                isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
              )}>
                {entry.username}
                {isCurrentUser && <span className="text-sm ml-1">(You)</span>}
              </h3>
              
              {/* Level badge */}
              <Badge variant="outline" className="text-xs font-semibold bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 border-purple-300 dark:border-purple-600">
                Lv. {entry.level}
              </Badge>
            </div>
            
            {showDetails && (
              <div className="flex items-center space-x-4 mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="font-semibold">{entry.streak}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Target className="w-3 h-3 text-green-500" />
                  <span className="font-semibold">{entry.accuracy}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Score and Time */}
        <div className="text-right flex flex-col items-end space-y-1">
          <div className={cn(
            'text-2xl font-bold',
            isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
          )}>
            {entry.score.toLocaleString()}
          </div>
          
          {showDetails && (
            <div className="flex flex-col items-end space-y-1">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {entry.totalQuizzes} quizzes
              </div>
              <div className="flex items-center space-x-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <Clock className="w-3 h-3" />
                <span>{entry.averageTime}s</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Badges preview */}
        {showDetails && entry.badges.length > 0 && (
          <div className="flex space-x-1">
            {entry.badges.slice(0, 3).map((badge, index) => (
              <div key={index} className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Award className="w-3 h-3 text-yellow-800" />
              </div>
            ))}
            {entry.badges.length > 3 && (
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                +{entry.badges.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Hover effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Main leaderboard component
interface InteractiveLeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  period?: LeaderboardPeriod
  category?: LeaderboardCategory
  onPeriodChange?: (period: LeaderboardPeriod) => void
  onCategoryChange?: (category: LeaderboardCategory) => void
  onUserClick?: (userId: string) => void
  showFilters?: boolean
  showSearch?: boolean
  className?: string
}

export function InteractiveLeaderboard({
  entries,
  currentUserId,
  period = 'weekly',
  category = 'score',
  onPeriodChange,
  onCategoryChange,
  onUserClick,
  showFilters = true,
  showSearch = true,
  className
}: InteractiveLeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [isLoading, setIsLoading] = useState(false)
  
  const filteredEntries = entries.filter(entry => 
    entry.username.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const currentUserEntry = entries.find(entry => entry.id === currentUserId)
  const currentUserRank = currentUserEntry?.rank
  
  const handlePeriodChange = (newPeriod: LeaderboardPeriod) => {
    setSelectedPeriod(newPeriod)
    setIsLoading(true)
    onPeriodChange?.(newPeriod)
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500)
  }
  
  const handleCategoryChange = (newCategory: LeaderboardCategory) => {
    setSelectedCategory(newCategory)
    setIsLoading(true)
    onCategoryChange?.(newCategory)
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500)
  }
  
  const CategoryIcon = CATEGORY_ICONS[selectedCategory]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Leaderboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {PERIOD_LABELS[selectedPeriod]} • {CATEGORY_LABELS[selectedCategory]}
            </p>
          </div>
        </div>
        
        {/* Current user rank */}
        {currentUserRank && (
          <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/20 px-4 py-2 rounded-lg">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Your Rank: #{currentUserRank}
            </span>
          </div>
        )}
      </div>
      
      {/* Filters and search */}
      {(showFilters || showSearch) && (
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Period filter */}
          {showFilters && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handlePeriodChange(key as LeaderboardPeriod)}
                    className={cn(
                      'px-3 py-2 text-sm font-medium transition-colors',
                      selectedPeriod === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Category filter */}
          {showFilters && (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                  const Icon = CATEGORY_ICONS[key as LeaderboardCategory]
                  return (
                    <button
                      key={key}
                      onClick={() => handleCategoryChange(key as LeaderboardCategory)}
                      className={cn(
                        'px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-1',
                        selectedCategory === key
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Search */}
          {showSearch && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span className="font-medium">Total Players</span>
          </div>
          <div className="text-2xl font-bold mt-1">{entries.length}</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span className="font-medium">Online Now</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {entries.filter(e => e.isOnline).length}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2">
            <CategoryIcon className="w-5 h-5" />
            <span className="font-medium">Top Score</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {entries[0]?.score.toLocaleString() || 0}
          </div>
        </div>
      </div>
      
      {/* Leaderboard entries */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="entries"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <LeaderboardEntryCard
                    entry={entry}
                    isCurrentUser={entry.id === currentUserId}
                    onUserClick={onUserClick}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {filteredEntries.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No players found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Try adjusting your search query.' : 'Be the first to join the leaderboard!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Mini leaderboard for dashboard
interface MiniLeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  maxEntries?: number
  showViewAll?: boolean
  onViewAll?: () => void
  className?: string
}

export function MiniLeaderboard({
  entries,
  currentUserId,
  maxEntries = 5,
  showViewAll = true,
  onViewAll,
  className
}: MiniLeaderboardProps) {
  const topEntries = entries.slice(0, maxEntries)
  
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Top Players</h3>
        {showViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {topEntries.map((entry) => (
          <LeaderboardEntryCard
            key={entry.id}
            entry={entry}
            isCurrentUser={entry.id === currentUserId}
            showDetails={false}
          />
        ))}
      </div>
    </div>
  )
}