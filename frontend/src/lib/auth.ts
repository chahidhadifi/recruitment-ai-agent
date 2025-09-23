import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DEFAULT_ADMIN_USER, DEFAULT_RECRUTEUR_USER, DEFAULT_CANDIDAT_USER, UserRole } from "@/types/user-roles";
import { randomBytes } from "crypto";

// Générer un secret aléatoire si NEXTAUTH_SECRET n'est pas défini
const secret = process.env.NEXTAUTH_SECRET || randomBytes(32).toString('hex');

// API URL
const API_URL = 'http://backend:8000';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        // Vérifier les informations d'identification
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Pour les boutons de test, utiliser les utilisateurs par défaut
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
            
            // Générer un token d'authentification pour les utilisateurs de test
            const token = `user_${userData.id}_${randomBytes(16).toString('hex')}`;
            
            return {
              id: userData.id,
              name: userData.name,
              email: credentials.email,
              image: userData.image,
              role: role,
              access_token: token
            };
          }

          // Sinon, utiliser l'API backend pour l'authentification
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          if (!response.ok) {
            console.error('Login failed:', await response.text());
            return null;
          }

          const data = await response.json();
          const user = data.user;
          
          console.log('Login successful, user data:', user);

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            image: user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=CD7F32&color=fff`,
            role: user.role,
            access_token: data.access_token
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
    }})
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
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        // Stocker le token d'accès s'il est disponible
        if (account?.access_token) {
          token.access_token = account.access_token;
        } else if (user.access_token) {
          // Pour les utilisateurs de test, le token est dans user.access_token
          token.access_token = user.access_token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        // Ajouter le token à la session
        session.user.token = token.access_token as string;
      }
      return session;
    },
  },
};