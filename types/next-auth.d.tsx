import "next-auth";
import { type DefaultSession } from "next-auth";
import { type DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: number;
      roleName: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    roleId: number;
    roleName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    roleId: number;
    roleName: string;
  }
}