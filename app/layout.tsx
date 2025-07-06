import type { Metadata } from 'next'
import './globals.css'
import { SocketProvider } from '@/lib/socket-context'
import { CookieConsent } from '@/components/cookie-consent'

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
    <html lang="en">
      <body>
        <SocketProvider>
          {children}
        </SocketProvider>
        <CookieConsent />
      </body>
    </html>
  )
}
