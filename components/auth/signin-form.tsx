"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"
import { signIn } from "@/lib/auth-actions"

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
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

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          <span className="text-xl font-bold">QuizCraft</span>
        </div>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="john@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
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
