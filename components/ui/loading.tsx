"use client"

import { Loader2 } from "lucide-react"
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center">
      <motion.div 
        className="text-center space-y-6 max-w-md mx-auto px-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Enhanced spinner with gradient */}
        <motion.div
          className="relative mx-auto w-16 h-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 animate-pulse" />
          <LoadingSpinner size="lg" className="relative z-10 border-indigo-500 border-t-purple-500" />
        </motion.div>
        
        {/* Brand logo/text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="text-2xl font-bold font-zen-dots bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            QuizCraft
          </h1>
          <p className="text-sm font-zen-dots text-gray-600 dark:text-gray-300 mb-2">
            Test your IQ with us
          </p>
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {text}
          </h2>
        </motion.div>
        
        {/* Animated progress dots */}
        <motion.div
          className="flex justify-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
        
        <motion.p 
          className="text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Crafting your quiz experience...
        </motion.p>
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