import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // ============================================================
    // CREDENTIALS
    // ============================================================

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
                  include: {
                    permission: true,
                  },
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

    // ============================================================
    // GITHUB
    // ============================================================

    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  // ============================================================
  // CALLBACKS
  // ============================================================

  callbacks: {
    // ------------------------------------------------------------
    // GITHUB SIGN IN
    // ------------------------------------------------------------

    async signIn({ user, account }) {
      // Only handle GitHub here.
      if (account?.provider !== "github") {
        return true;
      }

      // GitHub should provide an email because we request
      // user:email permission.
      if (!user.email) {
        return false;
      }

      const email = user.email
        .trim()
        .toLowerCase();

      // Check if this email already exists in Villaron.
      let dbUser = await prisma.user.findUnique({
        where: {
          email,
        },

        include: {
          role: true,
        },
      });

      // ----------------------------------------------------------
      // CREATE USER IF THIS IS THEIR FIRST GITHUB LOGIN
      // ----------------------------------------------------------

      if (!dbUser) {
        const defaultRole = await prisma.role.findUnique({
          where: {
            name: "USER",
          },
        });

        if (!defaultRole) {
          console.error(
            "USER role does not exist in the database."
          );

          return false;
        }

        dbUser = await prisma.user.create({
          data: {
            email,
            name: user.name || "GitHub User",
            image: user.image || null,

            // GitHub users don't have a Villaron password.
            password_hash: null,

            role_id: defaultRole.id,

            is_active: true,

            last_login: new Date(),
          },

          include: {
            role: true,
          },
        });
      } else {
        // --------------------------------------------------------
        // EXISTING USER
        // --------------------------------------------------------

        if (!dbUser.is_active) {
          return false;
        }

        await prisma.user.update({
          where: {
            id: dbUser.id,
          },

          data: {
            last_login: new Date(),

            // Update image/name from GitHub only when available.
            image: user.image || dbUser.image,
            name: user.name || dbUser.name,
          },
        });
      }

      return true;
    },

    // ------------------------------------------------------------
    // JWT
    // ------------------------------------------------------------

    async jwt({ token, user }) {
      /*
       * This runs when the user first signs in.
       *
       * Instead of trusting the OAuth provider's ID,
       * find the actual Villaron database user.
       */

      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: user.email.toLowerCase(),
          },

          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        if (dbUser) {
          // IMPORTANT:
          // This is the Prisma User.id, not the GitHub ID.
          token.id = String(dbUser.id);

          token.role = dbUser.role.name;
          token.roleId = dbUser.role_id;
          token.roleName = dbUser.role.name;
          token.roleLevel = dbUser.role.level;

          token.isSeller = dbUser.is_seller;
          token.sellerVerified = dbUser.seller_verified;

          token.permissions =
            dbUser.role.permissions.map(
              (rp) => rp.permission.name
            );
        }
      }

      return token;
    },

    // ------------------------------------------------------------
    // SESSION
    // ------------------------------------------------------------

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        session.user.role =
          token.role as string;

        session.user.roleId =
          token.roleId as number;

        session.user.roleName =
          token.roleName as string;

        session.user.roleLevel =
          token.roleLevel as number;

        session.user.isSeller =
          token.isSeller as boolean;

        session.user.sellerVerified =
          token.sellerVerified as boolean;

        session.user.permissions =
          token.permissions as string[];
      }

      return session;
    },
  },
});