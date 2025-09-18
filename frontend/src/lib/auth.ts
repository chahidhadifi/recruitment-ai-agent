import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DEFAULT_ADMIN_USER, DEFAULT_RECRUTEUR_USER, DEFAULT_CANDIDAT_USER, UserRole } from "@/types/user-roles";
import { randomBytes } from "crypto";

// Générer un secret aléatoire si NEXTAUTH_SECRET n'est pas défini
const secret = process.env.NEXTAUTH_SECRET || randomBytes(32).toString('hex');

// Afficher des informations de débogage pour l'authentification
console.log('Auth configuration loaded with secret:', secret ? 'Secret defined' : 'No secret defined');

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

        // Vérification du mot de passe avec le backend
        try {
          console.log('Tentative de connexion avec les identifiants:', { email: credentials.email });
          // Utiliser l'URL du backend définie dans l'API_URL
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          console.log('Réponse du backend:', { status: response.status, ok: response.ok });
          
          if (!response.ok) {
            console.error('Authentication failed:', await response.text());
            return null;
          }
          
          const userData = await response.json();
          console.log('Authentication successful, received data:', userData);
          
          return {
            id: userData.user.id.toString(),
            name: userData.user.name,
            email: userData.user.email,
            image: userData.user.image || '',
            role: userData.user.role as UserRole,
            accessToken: userData.access_token
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
        
        // Cette ligne n'est jamais atteinte car nous acceptons tous les mots de passe
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
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};