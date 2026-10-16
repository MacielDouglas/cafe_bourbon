import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun run db:seed",
  },
  datasource: {
    // Conexão direta (sem pooler) — migrations não funcionam via PgBouncer em modo transação.
    // Fallback local permite `prisma generate`/`format` sem .env; migrate/deploy exigem a URL real.
    url: process.env.DATABASE_URL_UNPOOLED ?? "postgresql://user:pass@localhost:5432/cafebourbon",
  },
});
