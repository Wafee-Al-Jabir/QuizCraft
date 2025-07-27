"use client"

import { Mail } from "lucide-react"

export function ErrorFooter() {
  return (
    <footer className="w-full py-4 px-6 border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>
            If any errors email{" "}
            <a 
              href="mailto:wafee.aljabir@gmail.com" 
              className="text-primary hover:underline transition-colors"
            >
              wafee.aljabir@gmail.com
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}