import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { getDatabase } from "./mongodb"
import { userDocumentToUser, userToUserDocument } from "./db-models"
import type { User, UserDocument } from "./types"

// Simple in-memory sessions for demo (in production, use Redis or database)
const sessions: Map<string, string> = new Map() // sessionId -> userId

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (!sessionId) return null

  const userId = sessions.get(sessionId)
  if (!userId) return null

  try {
    const db = await getDatabase()
    const userDoc = await db.collection<UserDocument>("users").findOne({ _id: new ObjectId(userId) })

    if (!userDoc) return null

    return userDocumentToUser(userDoc)
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
  try {
    const db = await getDatabase()

    const userDoc = userToUserDocument({
      ...userData,
      createdAt: new Date().toISOString(),
    })

    const result = await db.collection<UserDocument>("users").insertOne(userDoc)

    return {
      id: result.insertedId.toString(),
      ...userData,
      createdAt: userDoc.createdAt,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getDatabase()
    const userDoc = await db.collection<UserDocument>("users").findOne({ email })

    if (!userDoc) return null

    return userDocumentToUser(userDoc)
  } catch (error) {
    console.error("Error finding user by email:", error)
    return null
  }
}

export function createSession(userId: string): string {
  const sessionId = Math.random().toString(36).substring(2, 15)
  sessions.set(sessionId, userId)
  return sessionId
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}
