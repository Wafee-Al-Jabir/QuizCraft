import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DonateButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function DonateButton({
  className,
  variant = "outline",
  size = "sm",
}: DonateButtonProps) {
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn(
        "border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 dark:border-pink-800/60 dark:text-pink-300 dark:hover:bg-pink-950/30",
        className
      )}
      aria-label="Donate with Stripe"
    >
      <Link href="/donate">
        <Heart className="h-4 w-4" />
        <span className="hidden sm:inline">Donate</span>
      </Link>
    </Button>
  )
}
