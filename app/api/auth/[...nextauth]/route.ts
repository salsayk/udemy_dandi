import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // On initial sign in, persist user data to the token
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
        token.picture = user.image;
        token.name = user.name;
        token.email = user.email;
      }
      // Also get picture from Google profile if available
      if (profile) {
        token.picture = (profile as { picture?: string }).picture || token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass user data from token to session
      if (session.user) {
        session.user.id = token.sub!;
        session.user.image = token.picture as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/auth-error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

