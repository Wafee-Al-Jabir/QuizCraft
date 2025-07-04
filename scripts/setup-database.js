import { MongoClient } from "mongodb"

const uri =
  "mongodb+srv://wafeealjabir:Wafee2015@cluster0.5fslq8i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

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
    console.log("Created indexes on quizzes collection")

    // Create compound index for quiz participants
    await db.collection("quizzes").createIndex({ _id: 1, "participants.id": 1 })
    console.log("Created compound index for quiz participants")

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()
