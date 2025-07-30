"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SimpleThemeToggle } from "@/components/ui/theme-toggle"
import { BookOpen, Users, Trophy, Zap, LogOut } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { signOut } from "@/lib/auth-actions"
import type { User } from "@/lib/types"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { Badge } from "@/components/ui/badge"
import packageJson from "../package.json"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [hostLoading, setHostLoading] = useState(false)
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true)
  const [contentReady, setContentReady] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        // Faster loading - reduce delay
        setTimeout(() => setIsLoading(false), 100)
      }
    }
    checkAuth()
    
    // Hide loading animation after exactly 4 seconds (3.5s loading bar + 0.5s exit animation)
    const timer = setTimeout(() => {
      setShowLoadingAnimation(false)
    }, 4000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    window.location.reload()
  }

  const handleHostQuiz = () => {
    setHostLoading(true)
    // Simulate connection establishment
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 1500)
  }
  return (
    <>
      <LoadingAnimation 
        isVisible={showLoadingAnimation} 
        onComplete={() => setContentReady(true)}
      />
      
      {!showLoadingAnimation && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-background dark:via-background/95 dark:to-background/90 transition-all duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-zen-dots bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">QuizCraft</h1>
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700">
                  v{packageJson.version}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm font-zen-dots text-gray-500 dark:text-gray-400 -mt-1">Test your IQ with us</p>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <SimpleThemeToggle />
            {!mounted || isLoading ? (
              <div className="animate-pulse">
                <div className="h-9 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-shimmer"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Welcome, {user.firstName}!
                </span>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150">Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs sm:text-sm hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150">
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="text-xs sm:text-sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-3xl blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-gray-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
            Create Amazing Quizzes in Minutes
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
            Build engaging quizzes, share them with your audience, and track results. Perfect for educators, trainers, and
            content creators.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4 relative z-10">
          {mounted && user ? (
            <>
              <Link href="/quiz/create" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                  Create New Quiz
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleHostQuiz}
                disabled={hostLoading}
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 bg-white/80 dark:bg-card/80 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-300 dark:hover:border-indigo-400 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {hostLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                    <span>Please wait while we establish connection...</span>
                  </div>
                ) : (
                  'Host Quiz'
                )}
              </Button>
              <Link href="/quiz/join" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  Join Quiz
                </Button>
              </Link>
            </>
          ) : mounted ? (
            <>
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                  Start Creating Free
                </Button>
              </Link>
              <Link href="/quiz/join" className="w-full sm:w-auto">
                 <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 bg-white/80 dark:bg-card/80 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-300 dark:hover:border-indigo-400 hover:shadow-lg transition-all duration-150 hover:scale-105">
                   Join Quiz
                 </Button>
               </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  View Demo
                </Button>
              </Link>
            </>
          ) : (
            <div className="animate-pulse flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="h-12 w-full sm:w-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-shimmer"></div>
              <div className="h-12 w-full sm:w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-shimmer"></div>
              <div className="h-12 w-full sm:w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-shimmer"></div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <h3 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-8 sm:mb-12">Why Choose QuizCraft?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Card className="text-center bg-gradient-to-br from-gray-50 to-white dark:from-card dark:to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg mb-4 mx-auto w-fit">
                <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">Lightning Fast</CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Create professional quizzes in minutes with our intuitive interface</CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center bg-gradient-to-br from-gray-50 to-white dark:from-card dark:to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4 mx-auto w-fit">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Share & Collaborate</CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Share quizzes with your team or publish them for the world to see</CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-gray-50 to-white dark:from-card dark:to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg mb-4 mx-auto w-fit">
                <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Track Results</CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Monitor performance and get insights on quiz completion rates</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-background dark:via-background/95 dark:to-background text-white dark:text-gray-300 py-12 border-t border-gray-700 dark:border-border">
        <div className="container mx-auto px-4 text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4 hover:opacity-80 transition-opacity duration-200">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold font-zen-dots bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">QuizCraft</span>
              <p className="text-xs font-zen-dots text-gray-400 dark:text-gray-500 -mt-1">Test your IQ with us</p>
            </div>
          </Link>
          <p className="text-gray-400 dark:text-gray-500">© 2025 QuizCraft. Built with Next.js by Wafee Al-Jabir.</p>
        </div>
      </footer>
        </div>
      )}
    </>
  )
}
