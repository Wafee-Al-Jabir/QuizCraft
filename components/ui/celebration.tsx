"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CelebrationProps {
  show: boolean
  onComplete?: () => void
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  velocity: { x: number; y: number }
  rotation: number
  rotationSpeed: number
}

const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']

export function Celebration({ show, onComplete }: CelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [balloons, setBalloons] = useState<Particle[]>([])

  useEffect(() => {
    if (show) {
      // Create confetti particles
      const newParticles: Particle[] = []
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          velocity: {
            x: (Math.random() - 0.5) * 4,
            y: Math.random() * 3 + 2
          },
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10
        })
      }
      setParticles(newParticles)

      // Create balloons
      const newBalloons: Particle[] = []
      for (let i = 0; i < 8; i++) {
        newBalloons.push({
          id: i + 100,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 20 + 30,
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: -(Math.random() * 2 + 1)
          },
          rotation: 0,
          rotationSpeed: 0
        })
      }
      setBalloons(newBalloons)

      // Clear after animation
      const timer = setTimeout(() => {
        setParticles([])
        setBalloons([])
        onComplete?.()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  useEffect(() => {
    if (particles.length === 0 && balloons.length === 0) return

    const animationFrame = requestAnimationFrame(function animate() {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.velocity.x,
        y: particle.y + particle.velocity.y,
        rotation: particle.rotation + particle.rotationSpeed,
        velocity: {
          ...particle.velocity,
          y: particle.velocity.y + 0.1 // gravity
        }
      })).filter(particle => particle.y < window.innerHeight + 50))

      setBalloons(prev => prev.map(balloon => ({
        ...balloon,
        x: balloon.x + balloon.velocity.x,
        y: balloon.y + balloon.velocity.y
      })).filter(balloon => balloon.y > -100))

      if (particles.length > 0 || balloons.length > 0) {
        requestAnimationFrame(animate)
      }
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [particles.length, balloons.length])

  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Confetti */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
      
      {/* Balloons */}
      {balloons.map(balloon => (
        <div
          key={balloon.id}
          className="absolute flex flex-col items-center"
          style={{
            left: balloon.x,
            top: balloon.y
          }}
        >
          <div
            className="rounded-full shadow-lg"
            style={{
              width: balloon.size,
              height: balloon.size * 1.2,
              backgroundColor: balloon.color,
              background: `radial-gradient(circle at 30% 30%, ${balloon.color}dd, ${balloon.color})`
            }}
          />
          <div 
            className="w-0.5 bg-gray-400" 
            style={{ height: balloon.size * 0.8 }}
          />
        </div>
      ))}
      
      {/* Sparkle overlay */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}