import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import { isRateLimited } from "./rate-limit";

// Armazenamento em memória de fallback para ambientes serverless read-only
declare global {
  var __inMemoryUsers: Array<{ id: string; name: string; email: string; passwordHash: string; plan: string }> | undefined;
}

if (!globalThis.__inMemoryUsers) {
  globalThis.__inMemoryUsers = [];
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials, req) {
        let ip = "unknown";
        if (req && req.headers) {
          const xForwardedFor = req.headers["x-forwarded-for"];
          if (xForwardedFor) {
            ip = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor.split(',')[0];
          }
        }
        
        if (ip !== "unknown" && isRateLimited(ip)) {
          throw new Error("Muitas tentativas. Tente novamente em 15 minutos.");
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Informe e-mail e senha.");
        }

        const emailLower = credentials.email.trim().toLowerCase();

        // 1. Conta Demo Oficial (funciona sem depender de seed)
        if (emailLower === "demo@gamehunter.com" && credentials.password === "123456") {
          return {
            id: "demo-hunter-id",
            email: "demo@gamehunter.com",
            name: "Caçador Demo",
            plan: "PRO"
          };
        }

        // 2. Tenta buscar no Prisma
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.trim() }
          });

          if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (!isValid) {
              throw new Error("Senha incorreta.");
            }
            return {
              id: user.id,
              email: user.email,
              name: user.name || "Caçador",
              plan: user.plan
            };
          }
        } catch (err: any) {
          if (err.message === "Senha incorreta.") throw err;
          console.warn("Prisma user lookup fallback:", err);
        }

        // 3. Fallback em memória
        const memUser = globalThis.__inMemoryUsers?.find(u => u.email.toLowerCase() === emailLower);
        if (memUser) {
          const isValid = await bcrypt.compare(credentials.password, memUser.passwordHash);
          if (!isValid) {
            throw new Error("Senha incorreta.");
          }
          return {
            id: memUser.id,
            email: memUser.email,
            name: memUser.name,
            plan: memUser.plan
          };
        }

        throw new Error("Usuário não encontrado. Crie uma conta gratuitamente ou use a Conta Demo.");
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as any).plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).plan = token.plan;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "super_secret_for_development",
};
