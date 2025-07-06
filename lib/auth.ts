import type { User } from "./types"

// Client-side authentication functions that work via API routes
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

// Helper function to get session ID from document.cookie (client-side only)
export function getSessionIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='))
  
  if (!sessionCookie) return null
  
  return sessionCookie.split('=')[1]
}
