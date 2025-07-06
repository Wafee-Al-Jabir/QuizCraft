import { MongoClient } from "mongodb"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: '.env.local' })

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not set')
}

async function setupDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("quizcraft")

    // Create indexes for better performance

    // Users collection indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    console.log("Created unique index on users.email")

    // Quizzes collection indexes
    await db.collection("quizzes").createIndex({ userId: 1 })
    await db.collection("quizzes").createIndex({ published: 1 })
    await db.collection("quizzes").createIndex({ createdAt: -1 })
    await db.collection("quizzes").createIndex({ userId: 1, published: 1 })
    console.log("Created indexes on quizzes collection")

    // Create compound index for quiz participants
    await db.collection("quizzes").createIndex({ _id: 1, "participants.id": 1 })
    console.log("Created compound index for quiz participants")

    // Create indexes for sessions collection
    await db.collection("sessions").createIndex({ sessionId: 1 }, { unique: true })
    await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    await db.collection("sessions").createIndex({ userId: 1 })
    console.log("Created indexes on sessions collection")

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()
