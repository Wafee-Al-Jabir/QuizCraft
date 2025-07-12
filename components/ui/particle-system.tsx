"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
  type: 'circle' | 'star' | 'heart' | 'sparkle'
}

interface ParticleSystemProps {
  active: boolean
  particleCount?: number
  colors?: string[]
  types?: Particle['type'][]
  duration?: number
  spread?: number
  gravity?: number
  className?: string
}

const PARTICLE_TYPES = {
  circle: '●',
  star: '★',
  heart: '♥',
  sparkle: '✨'
}

export function ParticleSystem({
  active,
  particleCount = 50,
  colors = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'],
  types = ['circle', 'star', 'sparkle'],
  duration = 3000,
  spread = 100,
  gravity = 0.5,
  className = ''
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  const createParticle = (centerX: number, centerY: number): Particle => {
    const angle = Math.random() * Math.PI * 2
    const velocity = Math.random() * 8 + 2
    const spreadRadius = Math.random() * spread
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: centerX + Math.cos(angle) * spreadRadius * 0.1,
      y: centerY + Math.sin(angle) * spreadRadius * 0.1,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - Math.random() * 3,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: duration,
      maxLife: duration,
      type: types[Math.floor(Math.random() * types.length)]
    }
  }

  const updateParticles = () => {
    setParticles(prevParticles => {
      return prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + gravity,
          life: particle.life - 16 // Assuming 60fps
        }))
        .filter(particle => particle.life > 0)
    })
  }

  useEffect(() => {
    if (active && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      
      const newParticles = Array.from({ length: particleCount }, () => 
        createParticle(centerX, centerY)
      )
      
      setParticles(newParticles)
    } else {
      setParticles([])
    }
  }, [active, particleCount, spread, duration])

  useEffect(() => {
    if (particles.length > 0) {
      const animate = () => {
        updateParticles()
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particles.length])

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ 
              opacity: particle.life / particle.maxLife,
              scale: 1,
              x: particle.x,
              y: particle.y
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute text-lg font-bold"
            style={{
              color: particle.color,
              fontSize: `${particle.size}px`,
              left: 0,
              top: 0
            }}
          >
            {PARTICLE_TYPES[particle.type]}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Preset particle effects
export function SuccessParticles({ active }: { active: boolean }) {
  return (
    <ParticleSystem
      active={active}
      colors={['#10b981', '#34d399', '#6ee7b7']}
      types={['star', 'sparkle']}
      particleCount={30}
      duration={2000}
    />
  )
}

export function CelebrationParticles({ active }: { active: boolean }) {
  return (
    <ParticleSystem
      active={active}
      colors={['#f59e0b', '#fbbf24', '#fcd34d', '#ef4444', '#f87171']}
      types={['star', 'heart', 'sparkle']}
      particleCount={60}
      duration={3000}
      spread={150}
    />
  )
}

export function PowerUpParticles({ active }: { active: boolean }) {
  return (
    <ParticleSystem
      active={active}
      colors={['#8b5cf6', '#a78bfa', '#c4b5fd']}
      types={['sparkle', 'star']}
      particleCount={20}
      duration={1500}
      spread={80}
    />
  )
}

export function ErrorParticles({ active }: { active: boolean }) {
  return (
    <ParticleSystem
      active={active}
      colors={['#ef4444', '#f87171']}
      types={['circle']}
      particleCount={15}
      duration={1000}
      spread={60}
      gravity={1}
    />
  )
}