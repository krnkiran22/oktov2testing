import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.id_token = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      //@ts-expect-error This error is intentional due to library limitation
      session.id_token = token.id_token;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

// ❌ Remove: export { handler as GET, handler as POST };
// ✅ Add:
export { handler as GET, handler as POST };
export default handler;
