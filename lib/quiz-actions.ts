"use server"

import { ObjectId } from "mongodb"
import { getDatabase } from "./mongodb"
import { quizDocumentToQuiz, quizToQuizDocument } from "./db-models"
import type { Quiz, QuizQuestion, QuizParticipant, QuizDocument } from "./types"

export async function createQuiz(data: {
  title: string
  description: string
  questions: QuizQuestion[]
  userId: string
  settings: {
    showLeaderboard: boolean
    randomizeQuestions: boolean
    randomizeOptions: boolean
  }
}): Promise<Quiz> {
  try {
    const db = await getDatabase()

    const quizDoc = quizToQuizDocument({
      title: data.title,
      description: data.description,
      questions: data.questions,
      userId: data.userId,
      published: false,
      participants: [],
      settings: data.settings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const result = await db.collection<QuizDocument>("quizzes").insertOne(quizDoc)

    return {
      id: result.insertedId.toString(),
      title: data.title,
      description: data.description,
      questions: data.questions,
      userId: data.userId,
      published: false,
      participants: [],
      settings: data.settings,
      createdAt: quizDoc.createdAt,
      updatedAt: quizDoc.updatedAt,
    }
  } catch (error) {
    console.error("Error creating quiz:", error)
    throw new Error("Failed to create quiz")
  }
}

export async function getQuizzes(userId: string): Promise<Quiz[]> {
  try {
    const db = await getDatabase()
    const quizDocs = await db
      .collection<QuizDocument>("quizzes")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return quizDocs.map(quizDocumentToQuiz)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return []
  }
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  try {
    const db = await getDatabase()
    const quizDoc = await db.collection<QuizDocument>("quizzes").findOne({ _id: new ObjectId(id) })

    if (!quizDoc) return null

    return quizDocumentToQuiz(quizDoc)
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return null
  }
}

export async function updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | null> {
  try {
    const db = await getDatabase()

    // Remove id from updates and convert userId if present
    const { id: _, userId, ...updateData } = updates
    const updateDoc: any = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    if (userId) {
      updateDoc.userId = new ObjectId(userId)
    }

    const result = await db
      .collection<QuizDocument>("quizzes")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateDoc }, { returnDocument: "after" })

    if (!result) return null

    return quizDocumentToQuiz(result)
  } catch (error) {
    console.error("Error updating quiz:", error)
    return null
  }
}

export async function deleteQuiz(id: string): Promise<boolean> {
  try {
    const db = await getDatabase()
    const result = await db.collection<QuizDocument>("quizzes").deleteOne({ _id: new ObjectId(id) })

    return result.deletedCount === 1
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return false
  }
}

export async function joinQuiz(quizId: string, participantName: string): Promise<{ participantId: string } | null> {
  try {
    const db = await getDatabase()

    const participantId = new ObjectId().toString()
    const participant: QuizParticipant = {
      id: participantId,
      name: participantName,
      score: 0,
      answers: [],
    }

    const result = await db
      .collection<QuizDocument>("quizzes")
      .updateOne({ _id: new ObjectId(quizId) }, { $push: { participants: participant } })

    if (result.matchedCount === 0) return null

    return { participantId }
  } catch (error) {
    console.error("Error joining quiz:", error)
    return null
  }
}

export async function submitAnswer(data: {
  quizId: string
  participantId: string
  questionId: string
  selectedOptions: number[]
  textAnswer?: string
  timeToAnswer: number
  isCorrect: boolean
  pointsEarned: number
}): Promise<boolean> {
  try {
    const db = await getDatabase()

    // First, add the answer to the participant's answers array
    await db.collection<QuizDocument>("quizzes").updateOne(
      {
        _id: new ObjectId(data.quizId),
        "participants.id": data.participantId,
      },
      {
        $push: {
          "participants.$.answers": {
            questionId: data.questionId,
            selectedOptions: data.selectedOptions,
            timeToAnswer: data.timeToAnswer,
            isCorrect: data.isCorrect,
            pointsEarned: data.pointsEarned,
          },
        },
      },
    )

    // Then, update the participant's score
    const result = await db.collection<QuizDocument>("quizzes").updateOne(
      {
        _id: new ObjectId(data.quizId),
        "participants.id": data.participantId,
      },
      {
        $inc: {
          "participants.$.score": data.pointsEarned,
        },
      },
    )

    return result.matchedCount > 0
  } catch (error) {
    console.error("Error submitting answer:", error)
    return false
  }
}

export async function getLeaderboard(quizId: string): Promise<QuizParticipant[]> {
  try {
    const db = await getDatabase()
    const quiz = await db.collection<QuizDocument>("quizzes").findOne({ _id: new ObjectId(quizId) })

    if (!quiz || !quiz.participants) return []

    return [...quiz.participants].sort((a, b) => b.score - a.score)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

export async function publishQuiz(id: string, published: boolean): Promise<boolean> {
  try {
    const db = await getDatabase()
    const result = await db.collection<QuizDocument>("quizzes").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          published,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    return result.matchedCount > 0
  } catch (error) {
    console.error("Error publishing quiz:", error)
    return false
  }
}

// Get quiz statistics
export async function getQuizStats(userId: string) {
  try {
    const db = await getDatabase()

    const stats = await db
      .collection<QuizDocument>("quizzes")
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalQuizzes: { $sum: 1 },
            publishedQuizzes: {
              $sum: { $cond: [{ $eq: ["$published", true] }, 1, 0] },
            },
            totalQuestions: {
              $sum: { $size: "$questions" },
            },
            totalParticipants: {
              $sum: { $size: { $ifNull: ["$participants", []] } },
            },
            averageScore: {
              $avg: {
                $avg: {
                  $map: {
                    input: { $ifNull: ["$participants", []] },
                    as: "participant",
                    in: "$$participant.score",
                  },
                },
              },
            },
          },
        },
      ])
      .toArray()

    return (
      stats[0] || {
        totalQuizzes: 0,
        publishedQuizzes: 0,
        totalQuestions: 0,
        totalParticipants: 0,
        averageScore: 0,
      }
    )
  } catch (error) {
    console.error("Error fetching quiz stats:", error)
    return {
      totalQuizzes: 0,
      publishedQuizzes: 0,
      totalQuestions: 0,
      totalParticipants: 0,
      averageScore: 0,
    }
  }
}
