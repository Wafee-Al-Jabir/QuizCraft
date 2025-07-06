"use server"

import { cookies } from "next/headers"
import { createUser, findUserByEmail, createSession, deleteSession } from "./auth-server"

export async function signUp(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    console.log("Existing user check:", existingUser ? "User exists" : "User does not exist")
    if (existingUser) {
      return { success: false, error: "User already exists" }
    }

    // Create user (in production, hash the password)
    const user = await createUser({
      firstName,
      lastName,
      email,
      password, // In production, hash this!
    })
    console.log("Created user:", { id: user.id, email: user.email })

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
      console.log("User found:", { id: user.id, email: user.email, passwordMatch: user.password === password })
    }
    
    if (!user || user.password !== password) {
      return { success: false, error: "Invalid credentials" }
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
