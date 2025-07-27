import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { SocketProvider } from "@/lib/socket-context"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorFooter } from "@/components/ui/error-footer"

export const metadata: Metadata = {
  title: "QuizCraft",
  description: "Created with Claude 4 Sonnet & v0.dev",
  generator: "Wafee Al-Jabir, Claude 4 Sonnet, v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          />
        </noscript>
      </head>
      <body className="font-[Poppins] bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SocketProvider>
            <div className="flex flex-col min-h-screen">
              <div className="flex-1">
                {children}
              </div>
              <ErrorFooter />
            </div>
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
