import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DEFAULT_ADMIN_USER, DEFAULT_RECRUTEUR_USER, DEFAULT_CANDIDAT_USER, UserRole } from "@/types/user-roles";
import { randomBytes } from "crypto";

// Générer un secret aléatoire si NEXTAUTH_SECRET n'est pas défini
const secret = process.env.NEXTAUTH_SECRET || randomBytes(32).toString('hex');

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        // Dans un environnement de production, vous devriez vérifier les informations d'identification
        // par rapport à une base de données ou un service d'authentification
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Pour la démonstration, nous acceptons différents utilisateurs selon l'email
        if (credentials.password === "password") {
          // Déterminer le rôle en fonction de l'email
          let role: UserRole = "candidat";
          let userData = DEFAULT_CANDIDAT_USER;
          
          if (credentials.email.includes("admin")) {
            role = "admin";
            userData = DEFAULT_ADMIN_USER;
          } else if (credentials.email.includes("recruteur")) {
            role = "recruteur";
            userData = DEFAULT_RECRUTEUR_USER;
          }
          
          return {
            id: userData.id,
            name: userData.name,
            email: credentials.email,
            image: userData.image,
            role: role
          };
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
};