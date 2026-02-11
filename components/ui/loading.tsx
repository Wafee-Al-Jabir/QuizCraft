"use client"

import { useState, useEffect } from "react"
import { Loader2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { LoadingSpinner, Skeleton } from "./enhanced-loading"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
  variant?: "default" | "minimal" | "card"
}

export function Loading({ 
  className, 
  size = "md", 
  text = "Loading...", 
  variant = "default" 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  if (variant === "minimal") {
    return (
      <motion.div 
        className={cn("flex items-center justify-center", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <LoadingSpinner size={size} />
      </motion.div>
    )
  }

  if (variant === "card") {
    return (
      <motion.div 
        className={cn(
          "flex flex-col items-center justify-center p-8 bg-card rounded-lg border",
          className
        )}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <LoadingSpinner size={size} className="mb-4" />
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className={cn(
        "flex flex-col items-center justify-center min-h-[200px] space-y-4",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <LoadingSpinner size={size} />
      <motion.p 
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {text}
      </motion.p>
    </motion.div>
  )
}

// Page-level loading component with enhanced performance
export function PageLoading({ text = "Loading page..." }: { text?: string }) {
  const [tipsIndex, setTipsIndex] = useState(0)
  const tips = [
    "Did you know? You can earn badges for daily logins!",
    "Challenge your friends to a real-time quiz battle.",
    "The faster you answer, the more points you earn!",
    "Customize your profile to stand out in the leaderboard.",
    "Create your own quizzes and share them with the world."
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setTipsIndex((prev) => (prev + 1) % tips.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [tips.length])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        className="relative z-10 text-center space-y-8 max-w-md mx-auto px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main Loading Visual */}
        <div className="relative mx-auto w-32 h-32">
          {/* Rotating outer rings */}
          <motion.div 
            className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-2 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Central Logo Animation */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-xl shadow-indigo-500/20">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Text Section */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold font-zen-dots tracking-tighter mb-1">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                QuizCraft
              </span>
            </h1>
            <div className="h-1 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full mb-4" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground/80 tracking-tight">
              {text}
            </h2>
            
            {/* Dynamic Tips */}
            <div className="h-12 flex items-center justify-center">
              <motion.p 
                key={tipsIndex}
                className="text-sm text-muted-foreground italic"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4 }}
              >
                "{tips[tipsIndex]}"
              </motion.p>
            </div>
          </div>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-48 mx-auto space-y-3">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <motion.p 
            className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Connecting to server
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

// Dashboard loading skeleton
export function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black p-4">
      <motion.div 
        className="container mx-auto space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header skeleton */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </motion.div>
        
        {/* Stats cards skeleton */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[...Array(4)].map((_, i) => (
            <motion.div 
              key={i} 
              className="bg-card dark:bg-gray-800 rounded-lg p-6 space-y-3 border"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Content skeleton */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-32" />
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i} 
                className="bg-card dark:bg-gray-800 rounded-lg p-4 space-y-3 border"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </motion.div>
            ))}
          </div>
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Skeleton className="h-6 w-24" />
            <div className="bg-card dark:bg-gray-800 rounded-lg p-4 space-y-3 border">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}