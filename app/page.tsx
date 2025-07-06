"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Trophy, Zap, LogOut } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { signOut } from "@/lib/auth-actions"
import type { User } from "@/lib/types"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    window.location.reload()
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">QuizCraft</h1>
          </div>
          <div className="space-x-4">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-9 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.firstName}!
                </span>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">Create Amazing Quizzes in Minutes</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Build engaging quizzes, share them with your audience, and track results. Perfect for educators, trainers, and
          content creators.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {user ? (
            <>
              <Link href="/quiz/create">
                <Button size="lg" className="text-lg px-8 py-3">
                  Create New Quiz
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                  Host Quiz
                </Button>
              </Link>
              <Link href="/quiz/join">
                <Button variant="secondary" size="lg" className="text-lg px-8 py-3 font-mono tracking-wide">
                  Join Quiz
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Start Creating Free
                </Button>
              </Link>
              <Link href="/quiz/join">
                 <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent font-mono tracking-wide">
                   Join Quiz
                 </Button>
               </Link>
              <Link href="/demo">
                <Button variant="secondary" size="lg" className="text-lg px-8 py-3">
                  View Demo
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose QuizCraft?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>Create professional quizzes in minutes with our intuitive interface</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Share & Collaborate</CardTitle>
              <CardDescription>Share quizzes with your team or publish them for the world to see</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Trophy className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Track Results</CardTitle>
              <CardDescription>Monitor performance and get insights on quiz completion rates</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">QuizCraft</span>
          </div>
          <p className="text-gray-400">© 2024 QuizCraft. Built with Next.js and passion for learning.</p>
        </div>
      </footer>
    </div>
  )
}
