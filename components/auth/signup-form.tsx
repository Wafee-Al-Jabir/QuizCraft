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
import { signUp } from "@/lib/auth-actions"

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")

    try {
      const result = await signUp(formData)
      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Failed to create account")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignUp() {
    setIsGoogleLoading(true)
    setError("")
    
    try {
      const result = await nextAuthSignIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false 
      })
      
      if (result?.error) {
        setError('Failed to sign up with Google')
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (err) {
      setError('An unexpected error occurred with Google sign up')
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
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Enter your information to create your QuizCraft account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Google Sign Up Button */}
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading || isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isGoogleLoading ? "Signing up with Google..." : "Continue with Google"}
          </Button>
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or create account with email</span>
            </div>
          </div>
          
          {/* Email/Password Form */}
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" name="firstName" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" placeholder="Doe" required />
              </div>
            </div>
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
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </div>
        
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/signin" className="underline text-indigo-600">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
