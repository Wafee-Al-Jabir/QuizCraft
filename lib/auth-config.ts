import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import type { Adapter } from "next-auth/adapters"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('Invalid/Missing environment variable: "GOOGLE_CLIENT_ID"')
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Invalid/Missing environment variable: "GOOGLE_CLIENT_SECRET"')
}

const client = new MongoClient(process.env.MONGODB_URI)
const clientPromise = client.connect()

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
          provider: 'google',
          providerId: profile.sub,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = user.id
        // Add custom fields if they exist
        if (user.firstName) session.user.firstName = user.firstName
        if (user.lastName) session.user.lastName = user.lastName
        if (user.provider) session.user.provider = user.provider
        if (user.image) session.user.image = user.image
        if (user.streakData) session.user.streakData = user.streakData
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  events: {
    async createUser({ user }) {
      // Set createdAt timestamp for new OAuth users
      if (user.provider && !user.createdAt) {
        const db = (await clientPromise).db()
        await db.collection('users').updateOne(
          { _id: user.id },
          { 
            $set: { 
              createdAt: new Date().toISOString(),
              provider: user.provider,
              providerId: user.providerId
            } 
          }
        )
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
  debug: process.env.NODE_ENV === 'development',
}