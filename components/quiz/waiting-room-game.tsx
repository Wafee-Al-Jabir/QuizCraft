"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

interface Participant {
  id: string
  name: string
  score: number
}

interface QuizInfo {
  title: string
  description: string
  totalQuestions: number
  timePerQuestion: number
}

interface WaitingRoomGameProps {
  participants: Participant[]
  participantName: string
  quizInfo: QuizInfo | null
}

interface Bird {
  x: number
  y: number
  velocity: number
}

interface Pipe {
  x: number
  topHeight: number
  bottomY: number
  passed: boolean
}

const ANIMALS = [
  { id: 'cat', name: 'Cat', emoji: '🐱', color: '#FF6B6B' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', color: '#4ECDC4' },
  { id: 'fox', name: 'Fox', emoji: '🦊', color: '#FF8C42' },
  { id: 'bear', name: 'Bear', emoji: '🐻', color: '#8B4513' },
  { id: 'panda', name: 'Panda', emoji: '🐼', color: '#2C3E50' },
  { id: 'koala', name: 'Koala', emoji: '🐨', color: '#95A5A6' },
  { id: 'tiger', name: 'Tiger', emoji: '🐯', color: '#E67E22' },
  { id: 'lion', name: 'Lion', emoji: '🦁', color: '#F39C12' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵', color: '#8E44AD' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', color: '#7F8C8D' },
  { id: 'penguin', name: 'Penguin', emoji: '🐧', color: '#34495E' },
  { id: 'owl', name: 'Owl', emoji: '🦉', color: '#9B59B6' }
]

const GAME_WIDTH = 400
const GAME_HEIGHT = 300
const BIRD_SIZE = 20
const PIPE_WIDTH = 50
const PIPE_GAP = 120
const GRAVITY = 0.5
const JUMP_FORCE = -8
const PIPE_SPEED = 2

export function WaitingRoomGame({ participants, participantName, quizInfo }: WaitingRoomGameProps) {
  const [selectedAnimal, setSelectedAnimal] = useState(ANIMALS[0])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [bird, setBird] = useState<Bird>({ x: 50, y: GAME_HEIGHT / 2, velocity: 0 })
  const [pipes, setPipes] = useState<Pipe[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const lastPipeRef = useRef<number>(0)

  const resetGame = useCallback(() => {
    setBird({ x: 50, y: GAME_HEIGHT / 2, velocity: 0 })
    setPipes([])
    setScore(0)
    setGameOver(false)
    lastPipeRef.current = 0
  }, [])

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true)
      resetGame()
    }
    if (!gameOver) {
      setBird(prev => ({ ...prev, velocity: JUMP_FORCE }))
    } else {
      resetGame()
      setGameStarted(true)
    }
  }, [gameStarted, gameOver, resetGame])

  const checkCollision = useCallback((bird: Bird, pipes: Pipe[]) => {
    // Check ground and ceiling collision
    if (bird.y <= 0 || bird.y >= GAME_HEIGHT - BIRD_SIZE) {
      return true
    }

    // Check pipe collision
    for (const pipe of pipes) {
      if (
        bird.x + BIRD_SIZE > pipe.x &&
        bird.x < pipe.x + PIPE_WIDTH &&
        (bird.y < pipe.topHeight || bird.y + BIRD_SIZE > pipe.bottomY)
      ) {
        return true
      }
    }

    return false
  }, [])

  const gameLoop = useCallback(() => {
    setBird(prev => {
      const newBird = {
        ...prev,
        y: prev.y + prev.velocity,
        velocity: prev.velocity + GRAVITY
      }

      return newBird
    })

    setPipes(prev => {
      let newPipes = prev.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
        .filter(pipe => pipe.x > -PIPE_WIDTH)

      // Add new pipe
      const now = Date.now()
      if (now - lastPipeRef.current > 2000) {
        const topHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50
        newPipes.push({
          x: GAME_WIDTH,
          topHeight,
          bottomY: topHeight + PIPE_GAP,
          passed: false
        })
        lastPipeRef.current = now
      }

      // Check for score
      newPipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
          pipe.passed = true
          setScore(prev => prev + 1)
        }
      })

      return newPipes
    })
  }, [])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(function animate() {
        gameLoop()
        gameLoopRef.current = requestAnimationFrame(animate)
      })
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameStarted, gameOver, gameLoop])

  useEffect(() => {
    if (gameStarted && checkCollision(bird, pipes)) {
      setGameOver(true)
    }
  }, [bird, pipes, gameStarted, checkCollision])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Draw pipes
    ctx.fillStyle = '#32CD32'
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight)
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, GAME_HEIGHT - pipe.bottomY)
    })

    // Draw bird (animal emoji)
    ctx.font = `${BIRD_SIZE}px Arial`
    ctx.fillText(selectedAnimal.emoji, bird.x, bird.y + BIRD_SIZE)

    // Draw score
    ctx.fillStyle = '#000'
    ctx.font = '20px Arial'
    ctx.fillText(`Score: ${score}`, 10, 30)

    if (!gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
      ctx.fillStyle = '#FFF'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Click to Start!', GAME_WIDTH / 2, GAME_HEIGHT / 2)
      ctx.textAlign = 'left'
    }

    if (gameOver) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
      ctx.fillStyle = '#FFF'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Game Over!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20)
      ctx.fillText(`Final Score: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10)
      ctx.fillText('Click to Restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40)
      ctx.textAlign = 'left'
    }
  }, [bird, pipes, score, gameStarted, gameOver, selectedAnimal])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        jump()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [jump])

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="dark:bg-gray-800 dark:border-gray-700 mb-4">
          <CardHeader>
            <CardTitle>Waiting for Quiz to Start</CardTitle>
            <CardDescription>
              {quizInfo ? `${quizInfo.title} - ${quizInfo.totalQuestions} questions` : 'Loading quiz info...'}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Side - Animal Selection & Participants */}
          <div className="space-y-4">
            {/* Animal Selection */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Choose Your Avatar</CardTitle>
                <CardDescription>Select an animal to represent you in the game</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {ANIMALS.map((animal) => (
                    <Button
                      key={animal.id}
                      variant={selectedAnimal.id === animal.id ? "default" : "outline"}
                      className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                        selectedAnimal.id === animal.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedAnimal(animal)}
                      style={{
                        backgroundColor: selectedAnimal.id === animal.id ? animal.color : undefined
                      }}
                    >
                      <span className="text-2xl">{animal.emoji}</span>
                      <span className="text-xs">{animal.name}</span>
                    </Button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedAnimal.emoji}</span>
                    <span className="font-medium">Selected: {selectedAnimal.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants List */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Participants ({participants.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      <span className={`text-black dark:text-black ${
                        participant.name === participantName ? 'font-bold' : ''
                      }`}>
                        {participant.name}
                        {participant.name === participantName && ' (You)'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Flappy Bird Game */}
          <div>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Flappy {selectedAnimal.name}</CardTitle>
                <CardDescription>
                  Play while you wait! Click or press Space to make your {selectedAnimal.name.toLowerCase()} fly.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  width={GAME_WIDTH}
                  height={GAME_HEIGHT}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  onClick={jump}
                />
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {!gameStarted ? 'Click the game area or press Space to start!' : 
                     gameOver ? 'Game Over! Click to restart.' : 
                     'Keep your animal flying!'}
                  </p>
                  {score > 0 && (
                    <p className="text-lg font-bold mt-2">Best Score: {score}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700 mt-4">
          <CardContent className="text-center py-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Waiting for the host to start the quiz...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}