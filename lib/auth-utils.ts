import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth-config"
import { getCurrentUserServer } from "./auth-server"
import type { User } from "./types"

/**
 * Get the current user from either NextAuth session or custom session
 * This function checks both authentication methods and returns the user
 */
export async function getCurrentUser(): Promise<User | null> {
  // First, try to get user from NextAuth session (OAuth)
  const session = await getServerSession(authOptions)
  if (session?.user) {
    // Convert NextAuth user to our User type
    const nextAuthUser = session.user as any
    return {
      id: nextAuthUser.id,
      firstName: nextAuthUser.firstName || nextAuthUser.name?.split(' ')[0] || '',
      lastName: nextAuthUser.lastName || nextAuthUser.name?.split(' ').slice(1).join(' ') || '',
      email: nextAuthUser.email || '',
      password: '', // OAuth users don't have passwords
      createdAt: nextAuthUser.createdAt || new Date().toISOString(),
      streakData: nextAuthUser.streakData,
    }
  }

  // If no NextAuth session, try custom session (credential-based)
  return await getCurrentUserServer()
}

/**
 * Check if the current user is authenticated via any method
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Get user authentication method
 */
export async function getAuthMethod(): Promise<'oauth' | 'credentials' | null> {
  const session = await getServerSession(authOptions)
  if (session?.user) {
    return 'oauth'
  }

  const user = await getCurrentUserServer()
  if (user) {
    return 'credentials'
  }

  return null
}