import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, ArrowLeft, Zap } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* 404 Animation */}
        <div className="relative">
          <div className="text-9xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
            404
          </div>
          <div className="absolute inset-0 text-9xl font-bold text-purple-500/20 blur-sm">
            404
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            The page you're looking for seems to have vanished into the digital void.
          </p>
        </div>

        {/* Illustration */}
        <div className="flex justify-center">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-4 text-gray-400">
                <Search className="h-12 w-12" />
                <div className="text-6xl font-thin">×</div>
                <Zap className="h-12 w-12" />
              </div>
              <p className="mt-4 text-gray-500 text-sm">
                The quiz you're looking for might have been moved or deleted
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 rounded-full transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            If you believe this is an error, please{" "}
            <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline">
              contact support
            </Link>
            {" "}or try refreshing the page.
          </p>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-20 h-20 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500" />
      </div>
    </div>
  )
}