import NextAuth, { NextAuthOptions, Session, User as NextAuthUser } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb-client';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models/User';

// Extend NextAuth types to include 'id' on session.user
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // ADD THIS LINE
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        await connectDB();
        
        let user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          const username = credentials.email.split('@')[0] + Math.random().toString(36).slice(2, 6);
          user = await User.create({
            email: credentials.email,
            name: credentials.email.split('@')[0],
            username,
            pagesRead: 0,
          });
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();
        
        let dbUser = await User.findOne({ email: user.email });
        
        if (!dbUser) {
          const username = user.email?.split('@')[0] + Math.random().toString(36).slice(2, 6);
          dbUser = await User.create({
            email: user.email,
            name: user.name,
            username,
            pagesRead: 0,
          });
        }
        
        user.id = dbUser._id.toString();
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };