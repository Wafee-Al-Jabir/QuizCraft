import type { Metadata } from 'next'
import './globals.css'
import { SocketProvider } from '@/lib/socket-context'
import { CookieConsent } from '@/components/cookie-consent'
import { ThemeProvider } from '@/components/theme-provider'
import { AnimatedLayout } from '@/components/ui/animated-layout'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'QuizCraft',
  description: 'Created with Claude 4 Sonnet & v0.dev',
  generator: 'Wafee Al-Jabir, Claude 4 Sonnet, v0.dev',
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
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="quizcraft-theme"
        >
          <>
            <SocketProvider>
              <AnimatedLayout>
                {children}
              </AnimatedLayout>
            </SocketProvider>
            <CookieConsent />
            <Toaster />
          </>
        </ThemeProvider>
      </body>
    </html>
  )
}
