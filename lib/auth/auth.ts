import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import GitHub from "next-auth/providers/github";

import { prisma } from "@/lib/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        const email = String(credentials.email)
          .trim()
          .toLowerCase();

        const password = String(credentials.password);

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        if (!user.is_active) {
          return null;
        }

        if (!user.password_hash) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!passwordMatches) {
          return null;
        }

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            last_login: new Date(),
          },
        });

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role.name,
          roleId: user.role_id,
          roleName: user.role.name,
          roleLevel: user.role.level,
          isSeller: user.is_seller,
          sellerVerified: user.seller_verified,
          permissions: user.role.permissions.map(
            (rp) => rp.permission.name
          ),
        };
      },
    }),
    
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.roleName = user.roleName;
        token.roleLevel = user.roleLevel;
        token.isSeller = user.isSeller;
        token.sellerVerified = user.sellerVerified;
        token.permissions = user.permissions;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.roleId = token.roleId as number;
        session.user.roleName = token.roleName as string;
        session.user.roleLevel = token.roleLevel as number;
        session.user.isSeller = token.isSeller as boolean;
        session.user.sellerVerified = token.sellerVerified as boolean;
        session.user.permissions = token.permissions as string[];
      }

      return session;
    },
  },
});