import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrisma } from "@/infrastructure/database/prisma";
import { getServerEnv } from "@/lib/env";

const env = getServerEnv();

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(getPrisma(), { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  // Rate limit explícito (evita depender de defaults implícitos da lib).
  // Em produção o armazenamento é o próprio banco; em dev fica desligado para
  // não interferir na suíte e2e.
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    storage: "database",
    window: 60,
    max: 30,
    customRules: {
      "/sign-in": { window: 60, max: 5 },
      "/sign-up": { window: 60, max: 3 },
      "/sign-out": { window: 60, max: 10 },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
        input: false,
      },
    },
  },
});
