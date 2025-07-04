"use server"

import { cookies } from "next/headers"
import { createUser, findUserByEmail, createSession, deleteSession } from "./auth"

export async function signUp(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Check if user already exists
  if (findUserByEmail(email)) {
    return { success: false, error: "User already exists" }
  }

  // Create user (in production, hash the password)
  const user = createUser({
    firstName,
    lastName,
    email,
    password, // In production, hash this!
  })

  // Create session
  const sessionId = createSession(user.id)
  const cookieStore = await cookies()
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  return { success: true }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const user = findUserByEmail(email)
  if (!user || user.password !== password) {
    return { success: false, error: "Invalid credentials" }
  }

  // Create session
  const sessionId = createSession(user.id)
  const cookieStore = await cookies()
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  return { success: true }
}

export async function signOut() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (sessionId) {
    deleteSession(sessionId)
  }

  cookieStore.delete("session")
}
