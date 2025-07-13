"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"
import { signUp } from "@/lib/auth-actions"

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
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
