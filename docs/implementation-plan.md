# Plano de implementação — Café Bourbon DDD

## Fase 1 — Docs e contratos (atual, sem credenciais)
- [x] Auditoria (`docs/audit.md`)
- [ ] `docs/implementation-plan.md` (este), `docs/domain-model.md`, `docs/architecture.md`, `docs/pairing-rules.md`, `docs/ai-assistant.md`
- [ ] `.env.example` (usuário preenche `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `GROQ_API_KEY`, `BETTER_AUTH_SECRET`)
- [ ] Mover legado para `legacy/` via `git mv` (preserva histórico)

## Fase 2 — Fundação (Bun + Next.js + shadcn BaseUI + Better Auth)
1. Scaffold em `D:\temp\cafe_bourbon_new` com `bunx --bun create-next-app@latest` (TS, Tailwind v4, App Router, `src/`, alias `@/*`), depois copiar para o repo.
2. `bunx --bun shadcn@latest init` (style new-york, base zinc) + componentes: `button, card, badge, input, select, form, dialog, sonner, separator, skeleton, tabs, accordion`.
3. Estrutura `src/modules/*/{domain,application,infrastructure,presentation}` + `src/components/ui` + `src/lib/env.ts` (Zod) + `src/lib/utils.ts` (`cn()`).
4. Verificação: `bun run typecheck && bun run lint && bun run build`.

## Fase 3 — Domínio + persistência (Prisma 7 + Neon)
- Schema: `Product`, `CoffeeProfile`, `CheeseProfile`, `WineProfile`, `Pairing` (editorial/calculada), `User/Session/Account/Verification` (Better Auth), `CartItem`, `Subscription` (planos Mensal/CoffeeLovers/Trimestral).
- `prisma.config.ts` com `DATABASE_URL_UNPOOLED`; `src/infrastructure/database/prisma.ts` com `PrismaNeon` + singleton.
- Seed idempotente: 4 cafés reais + 6 queijos + 6 vinhos demo + 8 pairings editoriais.
- Repositórios Prisma implementando portas do domínio; casos de uso `ListProducts`, `GetProductDetails`.

## Fase 4 — Catálogo + UI (só shadcn/BaseUI)
Home, `/produtos`, `/produtos/[slug]`, filtros por categoria, estados loading/erro/vazio (Skeleton + Sonner). Imagens café reais; queijo/vinho placeholder.

## Fase 5 — Motor de harmonização (sem LLM)
`PairingService` determinístico (intensidade, corpo, acidez, textura, notas) + `PairingScore` explicável + testes unitários. Páginas `/harmonizacoes` e API `GET /api/pairings`.

## Fase 6 — Descoberta
Questionário curto (shadcn `form`+`radio-group`+`slider`) → `RecommendProductsFromPreferences` determinístico. API `POST /api/recommendations`.

## Fase 7 — Assistente Groq
`LanguageModelProvider` + adaptador Groq no servidor, `POST /api/chat` com rate-limit, fallback sem IA. Página `/barista`.

## Fase 8 — Commerce + Auth + qualidade
Carrinho demonstrativo (preço do servidor) + assinatura melhorada + login Better Auth. `typecheck+lint+test+build`, docs Vercel/Neon, sem segredos no git.
