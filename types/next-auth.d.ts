import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { User as CustomUser } from "@/lib/types"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      firstName?: string
      lastName?: string
      provider?: string
      streakData?: CustomUser["streakData"]
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    firstName?: string
    lastName?: string
    provider?: string
    streakData?: CustomUser["streakData"]
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string
    firstName?: string
    lastName?: string
    provider?: string
    streakData?: CustomUser["streakData"]
  }
}
