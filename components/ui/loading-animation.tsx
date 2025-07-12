"use client"

import { motion, AnimatePresence } from "framer-motion"
import { BookOpen } from "lucide-react"

interface LoadingAnimationProps {
  isVisible: boolean
  onComplete?: () => void
}

export function LoadingAnimation({ isVisible, onComplete }: LoadingAnimationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-background dark:via-background/95 dark:to-background/90"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onAnimationComplete={() => {
            if (!isVisible) onComplete?.()
          }}
        >
          <div className="text-center">
            {/* Logo Animation */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 1.2, 
                ease: "easeOut",
                type: "spring",
                stiffness: 100
              }}
            >
              <motion.div
                className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl mx-auto w-fit"
                animate={{
                  boxShadow: [
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    "0 25px 50px -12px rgba(79, 70, 229, 0.25), 0 25px 50px -12px rgba(147, 51, 234, 0.25)",
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <BookOpen className="h-16 w-16 text-white" />
                </motion.div>
              </motion.div>
              
              {/* Floating particles */}
              {[
                { top: '55%', left: '85%' },
                { top: '75%', left: '70%' },
                { top: '85%', left: '30%' },
                { top: '75%', left: '15%' },
                { top: '55%', left: '15%' },
                { top: '35%', left: '30%' }
              ].map((position, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                  style={{
                    top: position.top,
                    left: position.left,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2 + i * 0.2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}
            </motion.div>
            
            {/* Logo Text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="text-4xl font-bold font-zen-dots bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                QuizCraft
              </h1>
              <p className="text-lg font-zen-dots text-gray-600 dark:text-gray-300 mt-2 mb-4">
                Test your IQ with us
              </p>
            </motion.div>
            
            {/* Loading Text */}
            <motion.p
              className="text-lg text-gray-600 dark:text-gray-300 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              Preparing your quiz experience...
            </motion.p>
            
            {/* Loading Bar */}
            <motion.div
              className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  delay: 1.5, 
                  duration: 2,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            
            {/* Loading Dots */}
            <motion.div
              className="flex justify-center space-x-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.4 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingAnimation