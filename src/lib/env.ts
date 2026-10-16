import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória (conexão pooled Neon)"),
  DATABASE_URL_UNPOOLED: z.string().min(1, "DATABASE_URL_UNPOOLED é obrigatória (migrations)"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET precisa de ao menos 32 caracteres"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/** Lê e valida as variáveis de servidor sob demanda (evita quebrar o build sem .env). */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  if (process.env.NEXT_PHASE === "phase-production-build") {
    // O Next avalia Route Handlers durante o build; sem .env real, usa
    // placeholders descartáveis. Em runtime a validação abaixo é estrita.
    cached = {
      DATABASE_URL: "postgresql://build:build@localhost:5432/build",
      DATABASE_URL_UNPOOLED: "postgresql://build:build@localhost:5432/build",
      BETTER_AUTH_SECRET: "build-phase-placeholder-secret-000000",
      BETTER_AUTH_URL: "http://localhost:3000",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    };
    return cached;
  }
  cached = serverEnvSchema.parse(process.env);
  return cached;
}

/** Indica se o assistente Groq está configurado. Sem chave, usa fallback degradado. */
export function hasGroqKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}
