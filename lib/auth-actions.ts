"use server"

import { cookies } from "next/headers"
import { createUser, findUserByEmail, createSession, deleteSession } from "./auth-server"

export async function signUp(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const provider = formData.get("provider") as string || "credentials"
  const providerId = formData.get("providerId") as string
  const image = formData.get("image") as string

  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    console.log("Existing user check:", existingUser ? "User exists" : "User does not exist")
    if (existingUser) {
      return { success: false, error: "User already exists" }
    }

    // Create user data object
    const userData: any = {
      firstName,
      lastName,
      email,
      provider,
    }

    // Add password only for credential-based signup
    if (provider === "credentials" && password) {
      userData.password = password // In production, hash this!
    }

    // Add OAuth-specific fields
    if (provider !== "credentials") {
      if (providerId) userData.providerId = providerId
      if (image) userData.image = image
    }

    // Create user
    const user = await createUser(userData)
    console.log("Created user:", { id: user.id, email: user.email, provider: user.provider })

    // Create session only for credential-based signup
    if (provider === "credentials") {
      const sessionId = await createSession(user.id)
      const cookieStore = await cookies()
      cookieStore.set("session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const user = await findUserByEmail(email)
    console.log("Sign in attempt:", { email, userFound: !!user })
    if (user) {
      console.log("User found:", { id: user.id, email: user.email, provider: user.provider })
    }
    
    if (!user) {
      return { success: false, error: "Invalid credentials" }
    }

    // Check if this is a credential-based user and validate password
    if (user.provider === "credentials" || !user.provider) {
      if (!user.password || user.password !== password) {
        return { success: false, error: "Invalid credentials" }
      }
    } else {
      // OAuth users should not sign in through this form
      return { success: false, error: "Please sign in with " + (user.provider || "OAuth") }
    }

    // Create session
    const sessionId = await createSession(user.id)
    const cookieStore = await cookies()
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return { success: true }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (sessionId) {
    await deleteSession(sessionId)
  }

  cookieStore.delete("session")
}
