"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn as nextAuthSignIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"
import { signIn } from "@/lib/auth-actions"
import { GoogleLogo } from "@/components/ui/google-logo"

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn(formData)
      if (result.success) {
        // Force a full page reload to ensure session is recognized
        window.location.replace("/dashboard")
        return // Don't set loading to false as we're redirecting
      } else {
        setError(result.error || "Invalid credentials")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    setError("")

    try {
      const result = await nextAuthSignIn('google', {
        callbackUrl: '/dashboard',
        redirect: false
      })

      if (result?.error) {
        setError('Failed to sign in with Google')
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (err) {
      setError('An unexpected error occurred with Google sign in')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-2 hover:opacity-80 transition-opacity duration-200">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold font-zen-dots">QuizCraft</span>
            <p className="text-xs font-zen-dots text-gray-500 -mt-1">Test your IQ with us</p>
          </div>
        </Link>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Email/Password Form */}
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-2 transition-colors duration-200"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {!isGoogleLoading && <GoogleLogo className="mr-2 h-4 w-4" />}
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </Button>
        </div>

        <div className="mt-4 text-center text-sm">
          {"Don't have an account? "}
          <Link href="/auth/signup" className="underline text-indigo-600">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
