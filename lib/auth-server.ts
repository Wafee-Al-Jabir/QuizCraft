import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { getDatabase } from "./mongodb"
import { userDocumentToUser, userToUserDocument } from "./db-models"
import type { User, UserDocument } from "./types"

// Server-side authentication functions that can use next/headers
export async function getCurrentUserServer(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  console.log("getCurrentUserServer - sessionId:", sessionId)
  if (!sessionId) return null

  try {
    const db = await getDatabase()
    
    // Find session in database
    const session = await db.collection("sessions").findOne({ 
      sessionId,
      expiresAt: { $gt: new Date() }
    })
    
    console.log("getCurrentUserServer - session from DB:", session)
    if (!session) return null

    const userDoc = await db.collection<UserDocument>("users").findOne({ _id: new ObjectId(session.userId) })

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

export async function createSession(userId: string): Promise<string> {
  const sessionId = Math.random().toString(36).substring(2, 15)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  try {
    const db = await getDatabase()
    await db.collection("sessions").insertOne({
      sessionId,
      userId,
      createdAt: new Date(),
      expiresAt
    })
    
    console.log("createSession - created session in DB:", { sessionId, userId })
    return sessionId
  } catch (error) {
    console.error("Error creating session:", error)
    throw new Error("Failed to create session")
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("sessions").deleteOne({ sessionId })
  } catch (error) {
    console.error("Error deleting session:", error)
  }
}

export async function deleteSessionFromCookies(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value
  
  if (sessionId) {
    await deleteSession(sessionId)
  }
}