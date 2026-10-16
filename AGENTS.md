# AGENTS.md — Instruções permanentes do projeto Café Bourbon

> Estas instruções valem para TODAS as sessões neste repositório. Têm prioridade sobre decisões pontuais.

## 1. Idioma e comunicação

- Responder SEMPRE em português do Brasil (pt-BR).
- Ser direto, objetivo e técnico. Sem emojis salvo pedido explícito.
- Ao final de cada fase: listar arquivos alterados, verificações executadas, resultados e pendências.

## 2. Stack obrigatória (não substituir sem autorização)

- Next.js com App Router + React + TypeScript em modo estrito (`strict: true`, sem `any`).
- Bun como runtime e gerenciador de pacotes. NUNCA usar `npm` ou `yarn`.
- Tailwind CSS v4 (sintaxe `@import "tailwindcss"`, sem `tailwind.config.js` legado).
- shadcn/ui **versão BaseUI** como base de TODA a interface. Regra de ouro:
  - SEMPRE reaproveitar componentes de `@/components/ui` quando existir um equivalente.
  - Só criar componente próprio se nenhum componente shadcn/BaseUI atender — e justificar.
  - Personalizar via `cn()` + tokens do tema, nunca com CSS global ad-hoc.
  - NÃO usar Bootstrap em hipótese alguma (o legado vendored será removido).
- Better Auth para autenticação (email/senha + OAuth quando configurado), integrado ao Prisma.
- Prisma ORM v7 (major estável; NÃO usar Prisma 8 RC) + Neon PostgreSQL via `@prisma/adapter-neon`.
- Groq API somente no servidor, atrás da abstração `LanguageModelProvider`.
- Zod para validação em todas as fronteiras (rotas, forms, APIs, env).
- Vercel para deploy.

## 3. Proibições

- NUNCA acessar `C:\*` nem arquivos `.env*`. Temporários sempre em `D:\temp`.
- NUNCA commitar segredos. `.env` real jamais entra no git; apenas `.env.example`.
- NUNCA expor `GROQ_API_KEY`, `DATABASE_URL`, `BETTER_AUTH_SECRET` ao cliente.
- NUNCA colocar chamadas Prisma dentro de entidades/VOs ou componentes React.
- NUNCA colocar regra de negócio em Server Components, Route Handlers ou componentes React.
- NUNCA simular resposta da Groq como se fosse real. Sem credencial: implementar lógica independente + documentar teste pendente.
- NUNCA criar arquivos vazios só para simular arquitetura. Cada arquivo deve ter propósito.

## 4. Arquitetura DDD (monólito modular)

```
src/
├── app/            # Route Handlers finos + páginas (presentation)
├── modules/
│   ├── catalog/    # domain/ application/ infrastructure/ presentation/
│   ├── pairing/
│   ├── discovery/
│   ├── assistant/
│   └── commerce/   # carrinho + assinatura (escopo confirmado)
├── components/ui/  # shadcn/BaseUI (reutilizável)
├── infrastructure/ # database/ ai/ observability/
└── lib/            # env/ validations/ utils/
```

Regras de dependência:

1. `domain/` não importa Next.js, React, Prisma, Groq ou UI.
2. `application/` depende de contratos do domínio, nunca de implementação de infra.
3. Prisma fica em `infrastructure/`. Groq fica atrás de `LanguageModelProvider`.
4. Rotas validam com Zod → invocam casos de uso → formatam resposta.

## 5. Comandos padrão (Bun)

- `bun install` — instalar
- `bun dev` — desenvolvimento
- `bun run typecheck` — `tsc --noEmit`
- `bun run lint` — eslint
- `bun test` — testes (vitest/bun test conforme configurado)
- `bun run build` — build produção
- `bunx --bun prisma migrate dev` — migrations (requer `DATABASE_URL_UNPOOLED`)
- `bunx --bun shadcn@latest add <componente>` — adicionar UI shadcn

## 6. Fluxo de trabalho

1. Auditoria antes de código (já feita em `docs/audit.md`).
2. Fases pequenas e verificáveis; rodar typecheck + testes a cada fase.
3. Seed idempotente; dados de queijo/vinho marcados como demonstrativos.
4. Imagens reais de queijos/vinhos serão enviadas pelo usuário — até lá, placeholders.
5. Commerce = carrinho demonstrativo (preço sempre do servidor) + assinatura melhorada (planos Mensal/Coffee Lovers/Trimestral). Sem checkout/pagamento real.
