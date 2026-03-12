import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Admin from "@/app/database/admin.model";
import User from "@/app/database/user.model";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "admin-login",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        await connectDB();
        const admin = await Admin.findOne({ email });
        if (!admin) return null;

        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) return null;

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
        return {};
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as string;
      session.user.loginAt = token.loginAt as number;
      return session;
    },
  },
});
