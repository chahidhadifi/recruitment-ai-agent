import { DefaultSession } from "next-auth";
import { UserRole } from "./user-roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      token?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: UserRole;
    access_token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    access_token?: string;
  }
}