import { PrismaAdapter } from "@next-auth/prisma-adapter"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import TwitterProvider from "next-auth/providers/twitter"
import prisma from "../../../lib/prismadb"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // TwitterProvider({
    //   clientId: process.env.TWITTER_CLIENT_ID || "",
    //   clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
    //   version: "2.0", // opt-in to Twitter OAuth 2.0
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      httpOptions: {
        timeout: 100000,
      },
    }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID || "",
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    // }),
  ],
  callbacks: {
    async session({ session, token, user }: any) {
      // Adding the user ID here so we can retrieve the user in the backend
      session.user.id = user?.id

      return session
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  cookies:
    process.env.NODE_ENV === "production"
      ? {
        sessionToken: {
          name: `__Secure-next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: "None",
            path: "/",
            secure: true,
            domain: process.env.COOKIE_DOMAIN || "localhost",
          },
        },
        callbackUrl: {
          name: `__Secure-next-auth.callback-url`,
          options: {
            sameSite: "None",
            path: "/",
            secure: true,
            domain: process.env.COOKIE_DOMAIN || "localhost",
          },
        },
        csrfToken: {
          name: `next-auth.csrf-token`,
          options: {
            httpOnly: true,
            sameSite: "None",
            path: "/",
            secure: true,
            domain: process.env.COOKIE_DOMAIN || "localhost",
          },
        },
      }
      : undefined,
}

export default NextAuth(authOptions)
