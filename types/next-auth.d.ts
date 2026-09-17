import "next-auth";
import { type DefaultSession } from "next-auth";
import { type DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      roleId: number;
      roleName: string;
      roleLevel: number;
      isSeller: boolean;
      sellerVerified: boolean;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    roleId: number;
    roleName: string;
    roleLevel: number;
    isSeller: boolean;
    sellerVerified: boolean;
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    roleId: number;
    roleName: string;
    roleLevel: number;
    isSeller: boolean;
    sellerVerified: boolean;
    permissions: string[];
  }
}