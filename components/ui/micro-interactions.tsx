"use client"

import React from 'react'
import { motion, MotionProps, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

// Animated button with hover and tap effects
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function AnimatedButton({ 
  variant = 'default', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: AnimatedButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  }

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg"
  }

  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props

  return (
    <motion.button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...(motionProps as Omit<HTMLMotionProps<"button">, "onDrag" | "onDragStart" | "onDragEnd">)}
    >
      {children}
    </motion.button>
  )
}

// Animated card with hover effects
interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none'
  clickable?: boolean
  onClick?: () => void
}

export function AnimatedCard({ 
  children, 
  className, 
  hoverEffect = 'lift', 
  clickable = false, 
  onClick 
}: AnimatedCardProps) {
  const hoverEffects = {
    lift: {
      y: -4,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    },
    glow: {
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
    },
    scale: {
      scale: 1.02
    },
    none: {}
  }

  return (
    <motion.div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        clickable && "cursor-pointer",
        className
      )}
      whileHover={hoverEffects[hoverEffect]}
      whileTap={clickable ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// Floating action button
export function FloatingActionButton({ 
  children, 
  className, 
  onClick 
}: { 
  children: React.ReactNode
  className?: string
  onClick?: () => void 
}) {
  return (
    <motion.button
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50",
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}

// Animated input with focus effects
interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function AnimatedInput({ label, error, className, ...props }: AnimatedInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props

  return (
    <div className="space-y-2">
      {label && (
        <motion.label
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          animate={{ 
            color: isFocused ? '#3b82f6' : '#374151',
            scale: isFocused ? 1.02 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      <motion.input
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...(motionProps as Omit<HTMLMotionProps<"input">, "onDrag" | "onDragStart" | "onDragEnd">)}
      />
      {error && (
        <motion.p
          className="text-sm text-red-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// Animated badge
export function AnimatedBadge({ 
  children, 
  variant = 'default', 
  className 
}: { 
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string 
}) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground"
  }

  return (
    <motion.div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}

// Animated list item
export function AnimatedListItem({ 
  children, 
  className, 
  delay = 0 
}: { 
  children: React.ReactNode
  className?: string
  delay?: number 
}) {
  return (
    <motion.div
      className={cn("p-4 border-b border-border last:border-b-0", className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.3, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ x: 4, backgroundColor: "rgba(0, 0, 0, 0.02)" }}
    >
      {children}
    </motion.div>
  )
}

// Staggered container for animating children
export function StaggeredContainer({ 
  children, 
  className, 
  staggerDelay = 0.1 
}: { 
  children: React.ReactNode
  className?: string
  staggerDelay?: number 
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Animated icon with rotation
export function AnimatedIcon({ 
  children, 
  className, 
  animate = true 
}: { 
  children: React.ReactNode
  className?: string
  animate?: boolean 
}) {
  return (
    <motion.div
      className={className}
      whileHover={animate ? { rotate: 360 } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}