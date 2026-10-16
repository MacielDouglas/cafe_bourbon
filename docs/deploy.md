# Deploy — Café Bourbon (Vercel + Neon)

Documento operacional para publicar o monólito modular na Vercel com banco Neon PostgreSQL.
Nenhum segredo é versionado: apenas `env.example` serve de template.

## 1. Pré-requisitos

- Repositório no GitHub (branch de produção definida no projeto Vercel).
- Projeto Neon com o banco do Café Bourbon (schema `public`).
- Conta Vercel conectada ao repositório.
- Bun é o gerenciador oficial. A Vercel detecta `bun.lock` automaticamente.

## 2. Variáveis de ambiente (Project → Settings → Environment Variables)

| Variável | Ambiente | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | Production/Preview | String **pooled** do Neon (host com `-pooler`). Usada em runtime. |
| `DATABASE_URL_UNPOOLED` | Production/Preview | String **direta** do Neon. Usada apenas por migrations. |
| `BETTER_AUTH_SECRET` | Production/Preview | Segredo com 32+ caracteres. Gere com `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Production/Preview | URL pública (ex.: `https://cafe-bourbon.vercel.app`). |
| `NEXT_PUBLIC_APP_URL` | Production/Preview | Mesma URL pública, exposta ao cliente. |
| `GROQ_API_KEY` | Production/Preview | Chave Groq — **apenas no servidor**. Sem ela, o barista usa fallback determinístico. |
| `GROQ_MODEL` | Production/Preview (opcional) | Padrão `openai/gpt-oss-120b`. |

Regras:

- Nunca exponha `GROQ_API_KEY`, `DATABASE_URL` ou `BETTER_AUTH_SECRET` com prefixo `NEXT_PUBLIC_`.
- O `.env` real fica fora do git; só `env.example` é versionado.

## 3. Migrations

O `prisma.config.ts` aponta `DATABASE_URL_UNPOOLED` para migrations (o pooler não suporta DDL).

Localmente, contra o banco de produção/desenvolvimento:

```
bunx --bun prisma migrate deploy
```

Em CI/deploy, encadeie o `migrate deploy` antes do build (ex.: `bunx --bun prisma migrate deploy && bun run build`).
A validação de env é estrita em runtime; durante o build o app usa placeholders descartáveis.

## 4. Build na Vercel

- **Install Command:** `bun install`
- **Build Command:** `bun run build`
- **Output:** gerenciado pelo Next.js (App Router).
- Node.js 20+.

O `next.config.ts` habilita `cacheComponents` (PPR). Páginas dinâmicas (`/carrinho`, `/assinatura`, `/produtos`, `/harmonizacoes`) fazem streaming de conteúdo dinâmico dentro de `<Suspense>`; os shells continuam pré-renderizados.

## 5. Seeds

Seed idempotente (produtos, perfis sensoriais e harmonizações editoriais):

```
bun run db:seed
```

Rode contra `DATABASE_URL_UNPOOLED` quando precisar repovoar um ambiente. Todos os produtos têm `isDemoData` marcado quando demonstrativos.

## 6. Checklist pós-deploy

- [ ] `/` responde 200.
- [ ] `/produtos` lista itens (banco respondendo).
- [ ] `/harmonizacoes` calcula harmonizações ao vivo.
- [ ] `/descobrir` retorna recomendações (`POST /api/recommendations`).
- [ ] `/barista` responde (`POST /api/chat`) — com ou sem Groq.
- [ ] `/assinatura` lista planos; assinatura exige login e retorna 401 sem sessão.
- [ ] `/carrinho` adiciona/ajusta itens com **preços do servidor**.
- [ ] Login/cadastro em `/entrar` e `/criar-conta`.
- [ ] Nenhuma variável sensível aparece no bundle do cliente.

## 7. Escopo demonstrativo (Fase 8)

O commerce é demonstrativo: o carrinho calcula preços no servidor e a assinatura (Mensal / Coffee Lovers / Trimestral) persiste um registro, **sem checkout, pagamento ou cobrança reais**.
