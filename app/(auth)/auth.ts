import { compare } from "bcrypt-ts";
import NextAuth, { type User, type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getUser } from "@/lib/db/queries";

import { authConfig } from "./auth.config";

interface ExtendedSession extends Session {
  user: User & {
    id: string;
    name?: string | null;
    image?: string | null;
  };
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);
        if (users.length === 0) return null;
        // biome-ignore lint: Forbidden non-null assertion.
        const passwordsMatch = await compare(password, users[0].password!);
        if (!passwordsMatch) return null;
        return users[0] as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || null;
        token.image = user.image || null;
      }

      if (trigger === "update" && session?.user?.email) {
        // Always fetch latest user data from DB
        const users = await getUser(session.user.email);
        const latestUser = users[0];
        if (latestUser) {
          token.id = latestUser.id;
          token.name = latestUser.name || null;
          token.image = latestUser.image || null;
        }
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null;
        session.user.image = token.image as string | null;
      }

      return session;
    },
  },
});
