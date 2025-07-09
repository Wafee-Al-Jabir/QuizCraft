"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedButton, AnimatedCard, AnimatedInput, AnimatedBadge, StaggeredContainer, FloatingActionButton, AnimatedIcon } from '@/components/ui/micro-interactions'
import { LoadingSpinner, PulsingDots, AnimatedProgress, Skeleton, LoadingOverlay } from '@/components/ui/enhanced-loading'
import { Celebration } from '@/components/ui/celebration'
import { PageTransition, SlidePageTransition, FadePageTransition } from '@/components/ui/page-transition'
import { Play, Star, Heart, Zap, Sparkles, Rocket, Trophy, Gift } from 'lucide-react'

export default function AnimationsDemo() {
  const [showCelebration, setShowCelebration] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [progress, setProgress] = useState(65)
  const [transitionType, setTransitionType] = useState<'default' | 'slide' | 'fade'>('default')

  const handleProgressIncrease = () => {
    setProgress(prev => Math.min(prev + 10, 100))
  }

  const handleProgressDecrease = () => {
    setProgress(prev => Math.max(prev - 10, 0))
  }

  const TransitionWrapper = ({ children }: { children: React.ReactNode }) => {
    switch (transitionType) {
      case 'slide':
        return <SlidePageTransition>{children}</SlidePageTransition>
      case 'fade':
        return <FadePageTransition>{children}</FadePageTransition>
      default:
        return <PageTransition>{children}</PageTransition>
    }
  }

  return (
    <TransitionWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black p-8">
        <div className="container mx-auto space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              QuizCraft Animations Demo
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience smooth page transitions, loading animations, and delightful micro-interactions
            </p>
          </motion.div>

          {/* Page Transitions Demo */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Page Transitions</h2>
            <div className="flex gap-4 flex-wrap">
              <Button 
                variant={transitionType === 'default' ? 'default' : 'outline'}
                onClick={() => setTransitionType('default')}
              >
                Default Transition
              </Button>
              <Button 
                variant={transitionType === 'slide' ? 'default' : 'outline'}
                onClick={() => setTransitionType('slide')}
              >
                Slide Transition
              </Button>
              <Button 
                variant={transitionType === 'fade' ? 'default' : 'outline'}
                onClick={() => setTransitionType('fade')}
              >
                Fade Transition
              </Button>
            </div>
          </section>

          {/* Animated Buttons */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Animated Buttons</h2>
            <div className="flex gap-4 flex-wrap">
              <AnimatedButton variant="default">
                <Play className="w-4 h-4" />
                Primary Button
              </AnimatedButton>
              <AnimatedButton variant="outline">
                <Star className="w-4 h-4" />
                Outline Button
              </AnimatedButton>
              <AnimatedButton variant="ghost">
                <Heart className="w-4 h-4" />
                Ghost Button
              </AnimatedButton>
              <AnimatedButton variant="destructive">
                <Zap className="w-4 h-4" />
                Destructive Button
              </AnimatedButton>
            </div>
          </section>

          {/* Animated Cards */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Animated Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatedCard hoverEffect="lift" className="p-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Lift Effect</h3>
                  <p className="text-muted-foreground">Hover to see the card lift up with shadow</p>
                </div>
              </AnimatedCard>
              <AnimatedCard hoverEffect="glow" className="p-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Glow Effect</h3>
                  <p className="text-muted-foreground">Hover to see the blue glow effect</p>
                </div>
              </AnimatedCard>
              <AnimatedCard hoverEffect="scale" className="p-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Scale Effect</h3>
                  <p className="text-muted-foreground">Hover to see the card scale up</p>
                </div>
              </AnimatedCard>
            </div>
          </section>

          {/* Loading Animations */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Loading Animations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">Spinner</h3>
                <LoadingSpinner size="lg" />
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">Pulsing Dots</h3>
                <PulsingDots />
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">Skeleton</h3>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">Progress Bar</h3>
                <div className="space-y-4">
                  <AnimatedProgress value={progress} showPercentage />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleProgressDecrease}>-</Button>
                    <Button size="sm" onClick={handleProgressIncrease}>+</Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Micro-interactions */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Micro-interactions</h2>
            <div className="space-y-6">
              {/* Animated Input */}
              <div className="max-w-md">
                <AnimatedInput 
                  label="Animated Input" 
                  placeholder="Type something..." 
                />
              </div>
              
              {/* Animated Badges */}
              <div className="flex gap-2 flex-wrap">
                <AnimatedBadge variant="default">Default Badge</AnimatedBadge>
                <AnimatedBadge variant="secondary">Secondary Badge</AnimatedBadge>
                <AnimatedBadge variant="outline">Outline Badge</AnimatedBadge>
                <AnimatedBadge variant="destructive">Destructive Badge</AnimatedBadge>
              </div>
              
              {/* Animated Icons */}
              <div className="flex gap-4">
                <AnimatedIcon className="text-yellow-500">
                  <Star className="w-8 h-8" />
                </AnimatedIcon>
                <AnimatedIcon className="text-red-500">
                  <Heart className="w-8 h-8" />
                </AnimatedIcon>
                <AnimatedIcon className="text-purple-500">
                  <Sparkles className="w-8 h-8" />
                </AnimatedIcon>
                <AnimatedIcon className="text-blue-500">
                  <Rocket className="w-8 h-8" />
                </AnimatedIcon>
              </div>
            </div>
          </section>

          {/* Staggered Animation */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Staggered Animations</h2>
            <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="p-4">
                  <h3 className="font-semibold">Item {item}</h3>
                  <p className="text-muted-foreground">This item animates in sequence</p>
                </Card>
              ))}
            </StaggeredContainer>
          </section>

          {/* Special Effects */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Special Effects</h2>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => setShowCelebration(true)}>
                <Trophy className="w-4 h-4" />
                Trigger Celebration
              </Button>
              <Button onClick={() => setShowLoading(true)}>
                <Gift className="w-4 h-4" />
                Show Loading Overlay
              </Button>
            </div>
          </section>

          {/* Floating Action Button */}
          <FloatingActionButton onClick={() => setShowCelebration(true)}>
            <Sparkles className="w-6 h-6" />
          </FloatingActionButton>

          {/* Celebration Effect */}
          <Celebration 
            show={showCelebration} 
            onComplete={() => setShowCelebration(false)} 
          />

          {/* Loading Overlay */}
          <LoadingOverlay 
            show={showLoading} 
            message="Processing your request..." 
          />
          
          {showLoading && (
            <div className="fixed bottom-4 left-4 z-50">
              <Button onClick={() => setShowLoading(false)}>
                Close Loading
              </Button>
            </div>
          )}
        </div>
      </div>
    </TransitionWrapper>
  )
}