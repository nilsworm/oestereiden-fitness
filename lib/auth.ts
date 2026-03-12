import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Admin from "@/app/database/admin.model";
import User from "@/app/database/user.model";
import LoginAttempt from "@/app/database/login-attempt.model";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "admin-login",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const { password } = credentials as { email: string; password: string };
        const email = (credentials as { email: string }).email.toLowerCase().trim();

        await connectDB();

        // Rate limiting: max 5 Versuche pro E-Mail in 15 Minuten
        const since = new Date(Date.now() - WINDOW_MS);
        const attempts = await LoginAttempt.countDocuments({ email, createdAt: { $gt: since } });
        if (attempts >= MAX_ATTEMPTS) return null;

        const admin = await Admin.findOne({ email });
        if (!admin) {
          await LoginAttempt.create({ email });
          return null;
        }

        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) {
          await LoginAttempt.create({ email });
          return null;
        }

        // Erfolgreicher Login: alte Versuche löschen
        await LoginAttempt.deleteMany({ email });
        return { id: admin._id.toString(), email: admin.email };
      },
    }),
    Credentials({
      id: "user-registration",
      credentials: {
        email: {},
      },
      async authorize(credentials) {
        const { email } = credentials as { email: string };

        await connectDB();
        const user = await User.findOne({ email });
        if (!user) return null;

        return { id: user._id.toString(), email: user.email };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 10 },
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        token.role = account.provider === "admin-login" ? "admin" : "user";
        token.loginAt = Date.now();
      }
      if (token.role === "user" && Date.now() - (token.loginAt as number) > 60 * 60 * 1000) {
        return { ...token, expired: true };
      }
      return token;
    },
    session({ session, token }) {
      if (token.expired) return {} as typeof session;
      session.user.role = token.role as string;
      session.user.loginAt = token.loginAt as number;
      return session;
    },
  },
});
