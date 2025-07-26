import { ObjectId } from "mongodb"
import type { User, Quiz, QuizParticipant } from "./types"

// Database document interfaces (with MongoDB ObjectId)
export interface UserDocument extends Omit<User, "id"> {
  _id?: ObjectId
}

export interface QuizDocument extends Omit<Quiz, "id" | "userId"> {
  _id?: ObjectId
  userId: ObjectId
}

export interface QuizParticipantDocument extends Omit<QuizParticipant, "id"> {
  _id?: ObjectId
}

// Conversion utilities
export function userDocumentToUser(doc: UserDocument): User {
  return {
    id: doc._id?.toString() || "",
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    password: doc.password,
    createdAt: doc.createdAt,
  }
}

export function userToUserDocument(user: Omit<User, "id">): UserDocument {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: user.password,
    createdAt: user.createdAt,
  }
}

export function quizDocumentToQuiz(doc: QuizDocument): Quiz {
  return {
    id: doc._id?.toString() || "",
    title: doc.title,
    description: doc.description,
    questions: doc.questions,
    userId: doc.userId.toString(),
    published: doc.published,
    participants: doc.participants || [],
    settings: doc.settings,
    tags: doc.tags || [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function quizToQuizDocument(quiz: Omit<Quiz, "id"> & { userId: string }): QuizDocument {
  return {
    title: quiz.title,
    description: quiz.description,
    questions: quiz.questions,
    userId: new ObjectId(quiz.userId),
    published: quiz.published,
    participants: quiz.participants || [],
    settings: quiz.settings,
    tags: quiz.tags || [],
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  }
}
