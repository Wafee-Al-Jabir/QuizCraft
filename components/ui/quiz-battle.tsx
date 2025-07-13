"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Swords, 
  Shield, 
  Zap, 
  Clock, 
  Users, 
  Crown, 
  Flame, 
  Target,
  Heart,
  Star,
  Trophy,
  Sword,
  Timer,
  CheckCircle,
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useSoundEffects } from './sound-effects'
import { Celebration } from './celebration'

export interface BattlePlayer {
  id: string
  username: string
  avatar?: string
  level: number
  score: number
  health: number
  maxHealth: number
  streak: number
  powerUps: string[]
  isReady: boolean
  isOnline: boolean
  accuracy: number
  answersCorrect: number
  answersTotal: number
}

export interface BattleQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  timeLimit: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  points: number
}

export interface BattleState {
  id: string
  players: BattlePlayer[]
  currentQuestion?: BattleQuestion
  questionIndex: number
  totalQuestions: number
  timeRemaining: number
  phase: 'waiting' | 'countdown' | 'question' | 'results' | 'finished'
  winner?: string
  spectators: number
}

interface PlayerCardProps {
  player: BattlePlayer
  isCurrentUser?: boolean
  position: 'left' | 'right'
  showStats?: boolean
  className?: string
}

export function PlayerCard({ 
  player, 
  isCurrentUser = false, 
  position,
  showStats = true,
  className 
}: PlayerCardProps) {
  const healthPercentage = (player.health / player.maxHealth) * 100
  const isLowHealth = healthPercentage <= 25
  
  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-lg border-2 transition-all duration-300',
        isCurrentUser 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
          : 'border-gray-200 dark:border-gray-700',
        position === 'left' ? 'text-left' : 'text-right',
        className
      )}
      initial={{ opacity: 0, x: position === 'left' ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background effects */}
      {player.streak >= 5 && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg animate-pulse" />
      )}
      
      <div className={cn(
        'relative z-10 flex items-center space-x-3',
        position === 'right' && 'flex-row-reverse space-x-reverse'
      )}>
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-800">
            <AvatarImage src={player.avatar} alt={player.username} />
            <AvatarFallback className="text-lg font-bold">
              {player.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Online indicator */}
          {player.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}
          
          {/* Level badge */}
          <div className="absolute -top-2 -left-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {player.level}
          </div>
        </div>
        
        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            'flex items-center space-x-2',
            position === 'right' && 'justify-end'
          )}>
            <h3 className="font-bold text-lg truncate">{player.username}</h3>
            {isCurrentUser && <Badge variant="outline">You</Badge>}
          </div>
          
          {/* Health bar */}
          <div className="mt-2 space-y-1">
            <div className={cn(
              'flex items-center justify-between text-sm',
              position === 'right' && 'flex-row-reverse'
            )}>
              <span className="flex items-center space-x-1">
                <Heart className={cn(
                  'w-4 h-4',
                  isLowHealth ? 'text-red-500 animate-pulse' : 'text-red-400'
                )} />
                <span>{player.health}/{player.maxHealth}</span>
              </span>
              
              {player.streak > 0 && (
                <span className="flex items-center space-x-1 text-orange-500">
                  <Flame className="w-4 h-4" />
                  <span>{player.streak}</span>
                </span>
              )}
            </div>
            
            <Progress 
              value={healthPercentage} 
              className={cn(
                'h-2',
                isLowHealth && 'animate-pulse'
              )}
            />
          </div>
          
          {/* Score */}
          <div className={cn(
            'mt-2 text-2xl font-bold',
            position === 'right' && 'text-right'
          )}>
            {player.score.toLocaleString()}
          </div>
          
          {/* Stats */}
          {showStats && (
            <div className={cn(
              'mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400',
              position === 'right' && 'justify-end'
            )}>
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span>{player.accuracy}%</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>{player.answersCorrect}/{player.answersTotal}</span>
              </div>
            </div>
          )}
          
          {/* Power-ups */}
          {player.powerUps.length > 0 && (
            <div className={cn(
              'mt-2 flex space-x-1',
              position === 'right' && 'justify-end'
            )}>
              {player.powerUps.slice(0, 3).map((powerUp, index) => (
                <div key={index} className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-yellow-800" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Battle arena component
interface BattleArenaProps {
  battleState: BattleState
  currentUserId: string
  onAnswerSelect: (answerIndex: number) => void
  onUsePowerUp: (powerUpId: string) => void
  onReady: () => void
  className?: string
}

export function BattleArena({
  battleState,
  currentUserId,
  onAnswerSelect,
  onUsePowerUp,
  onReady,
  className
}: BattleArenaProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const { playSound } = useSoundEffects()
  const timerRef = useRef<NodeJS.Timeout>()
  
  const currentUser = battleState.players.find(p => p.id === currentUserId)
  const opponent = battleState.players.find(p => p.id !== currentUserId)
  
  const timePercentage = battleState.currentQuestion 
    ? (battleState.timeRemaining / battleState.currentQuestion.timeLimit) * 100
    : 0
  
  const isTimeRunningOut = timePercentage <= 25
  
  useEffect(() => {
    if (battleState.phase === 'countdown' && soundEnabled) {
      playSound('click')
    }
    
    if (battleState.phase === 'finished' && battleState.winner === currentUserId) {
      setShowCelebration(true)
      if (soundEnabled) playSound('celebration')
      setTimeout(() => setShowCelebration(false), 5000)
    }
  }, [battleState.phase, battleState.winner, currentUserId, playSound, soundEnabled])
  
  const handleAnswerSelect = (answerIndex: number) => {
    if (battleState.phase !== 'question' || selectedAnswer !== null) return
    
    setSelectedAnswer(answerIndex)
    onAnswerSelect(answerIndex)
    
    if (soundEnabled) {
      playSound('click')
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'hard': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }
  
  const renderPhaseContent = () => {
    switch (battleState.phase) {
      case 'waiting':
        return (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <h2 className="text-2xl font-bold">Waiting for Players</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Get ready for an epic quiz battle!
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                {battleState.players.map((player) => (
                  <div key={player.id} className="text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-2">
                      <AvatarImage src={player.avatar} alt={player.username} />
                      <AvatarFallback>{player.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">{player.username}</div>
                    <Badge variant={player.isReady ? 'default' : 'outline'} className="text-xs mt-1">
                      {player.isReady ? 'Ready' : 'Not Ready'}
                    </Badge>
                  </div>
                ))}
              </div>
              
              {currentUser && !currentUser.isReady && (
                <Button onClick={onReady} size="lg" className="bg-green-500 hover:bg-green-600">
                  <Play className="w-4 h-4 mr-2" />
                  Ready to Battle!
                </Button>
              )}
            </div>
          </div>
        )
      
      case 'countdown':
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-8xl font-bold text-blue-500"
            >
              {Math.ceil(battleState.timeRemaining)}
            </motion.div>
            <h2 className="text-2xl font-bold">Battle Starting...</h2>
          </div>
        )
      
      case 'question':
        if (!battleState.currentQuestion) return null
        
        return (
          <div className="space-y-6">
            {/* Question header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <Badge variant="outline">
                  Question {battleState.questionIndex + 1} of {battleState.totalQuestions}
                </Badge>
                
                <Badge className={getDifficultyColor(battleState.currentQuestion.difficulty)}>
                  {battleState.currentQuestion.difficulty.toUpperCase()}
                </Badge>
                
                <Badge variant="outline">
                  {battleState.currentQuestion.category}
                </Badge>
              </div>
              
              {/* Timer */}
              <div className="space-y-2">
                <div className={cn(
                  'text-3xl font-bold',
                  isTimeRunningOut ? 'text-red-500 animate-pulse' : 'text-blue-500'
                )}>
                  {battleState.timeRemaining}s
                </div>
                
                <Progress 
                  value={timePercentage} 
                  className={cn(
                    'h-3',
                    isTimeRunningOut && 'animate-pulse'
                  )}
                />
              </div>
            </div>
            
            {/* Question */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-6 text-center">
                {battleState.currentQuestion.question}
              </h3>
              
              {/* Answer options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {battleState.currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      'p-4 rounded-lg border-2 text-left transition-all duration-200',
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                      selectedAnswer !== null && selectedAnswer !== index && 'opacity-50'
                    )}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold',
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      )}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 'results':
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Round Results</h2>
            
            {/* Show correct answer and player results */}
            <div className="space-y-4">
              {battleState.currentQuestion && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Correct Answer:</span>
                  </div>
                  <div className="mt-2 font-semibold">
                    {String.fromCharCode(65 + battleState.currentQuestion.correctAnswer)}) {battleState.currentQuestion.options[battleState.currentQuestion.correctAnswer]}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      
      case 'finished':
        const winner = battleState.players.find(p => p.id === battleState.winner)
        const isWinner = battleState.winner === currentUserId
        
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              <Trophy className={cn(
                'w-24 h-24 mx-auto',
                isWinner ? 'text-yellow-500' : 'text-gray-400'
              )} />
            </motion.div>
            
            <div>
              <h2 className={cn(
                'text-3xl font-bold mb-2',
                isWinner ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-400'
              )}>
                {isWinner ? 'Victory!' : 'Defeat'}
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {winner ? `${winner.username} wins the battle!` : 'Battle completed!'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              
              <Button>
                <Trophy className="w-4 h-4 mr-2" />
                View Stats
              </Button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <>
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
              <Swords className="w-6 h-6 text-white" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold">Quiz Battle</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Battle ID: {battleState.id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Spectators */}
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{battleState.spectators} watching</span>
            </div>
            
            {/* Sound toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Player cards */}
        {currentUser && opponent && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlayerCard 
              player={currentUser} 
              isCurrentUser={true} 
              position="left"
            />
            
            <div className="flex items-center justify-center lg:hidden">
              <div className="flex items-center space-x-2 text-2xl font-bold text-gray-400">
                <Sword className="w-6 h-6" />
                <span>VS</span>
                <Sword className="w-6 h-6" />
              </div>
            </div>
            
            <PlayerCard 
              player={opponent} 
              position="right"
            />
          </div>
        )}
        
        {/* VS indicator for larger screens */}
        <div className="hidden lg:flex items-center justify-center -my-3">
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full p-4">
            <div className="flex items-center space-x-2 text-2xl font-bold text-gray-600 dark:text-gray-400">
              <Sword className="w-6 h-6" />
              <span>VS</span>
              <Sword className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          {renderPhaseContent()}
        </div>
      </div>
      
      {/* Celebration effect */}
      <AnimatePresence>
        {showCelebration && (
          <Celebration show={showCelebration} />
        )}
      </AnimatePresence>
    </>
  )
}

// Battle lobby component
interface BattleLobbyProps {
  onCreateBattle: () => void
  onJoinBattle: (battleId: string) => void
  activeBattles: Array<{
    id: string
    players: number
    maxPlayers: number
    difficulty: string
    category: string
  }>
  className?: string
}

export function BattleLobby({ onCreateBattle, onJoinBattle, activeBattles, className }: BattleLobbyProps) {
  const [battleId, setBattleId] = useState('')
  
  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
            <Swords className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold">Quiz Battle Arena</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Challenge other players in real-time quiz battles!
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onCreateBattle} size="lg" className="bg-green-500 hover:bg-green-600">
            <Play className="w-4 h-4 mr-2" />
            Create Battle
          </Button>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Enter Battle ID"
              value={battleId}
              onChange={(e) => setBattleId(e.target.value)}
              className="w-40"
            />
            <Button 
              onClick={() => onJoinBattle(battleId)} 
              disabled={!battleId}
              variant="outline"
            >
              Join Battle
            </Button>
          </div>
        </div>
      </div>
      
      {/* Active battles */}
      {activeBattles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Active Battles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBattles.map((battle) => (
              <motion.div
                key={battle.id}
                className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => onJoinBattle(battle.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{battle.category}</Badge>
                  <Badge className={getDifficultyColor(battle.difficulty)}>
                    {battle.difficulty}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Battle ID: {battle.id}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">
                      {battle.players}/{battle.maxPlayers}
                    </span>
                  </div>
                  
                  <Button size="sm" variant="outline">
                    Join
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'easy': return 'text-green-500'
    case 'medium': return 'text-yellow-500'
    case 'hard': return 'text-red-500'
    default: return 'text-gray-500'
  }
}