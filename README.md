# Café Bourbon

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/bun-runtime-green.svg)](https://bun.sh/)
[![Tested with Vitest](https://img.shields.io/badge/tests-vitest-brightgreen.svg)](https://vitest.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/MacielDouglas/cafe_bourbon/pulls)

## Visão Geral

O **Café Bourbon** é um aplicativo full-stack para descobrir, comparar e harmonizar cafés especiais, queijos e vinhos. O sistema segue arquitetura DDD (Domain-Driven Design) modular, com separação clara entre domínio, aplicação, infraestrutura e apresentação.

- **Frontend**: Next.js com App Router, React, TypeScript estrito
- **Backend**: Prisma ORM v7 + PostgreSQL Neon
- **UI**: shadcn/BaseUI com Tailwind CSS v4
- **Autenticação**: Better Auth (email/senha + OAuth)
- **IA**: Groq API via `LanguageModelProvider` — Assistente Virtual do Barista
- **Deploy**: Vercel

## Arquitetura DDD Modular

```
src/
├── app/            # Route Handlers finos + páginas (presentation)
├── modules/
│   ├── catalog/    # domain/ application/ infrastructure/ presentation/
│   ├── pairing/
│   ├── discovery/
│   ├── assistant/
│   └── commerce/   # carrinho + assinatura
├── components/ui/  # shadcn/BaseUI (reutilizável)
├── infrastructure/ # database/ ai/ observability/
└── lib/            # env/ validations/ utils/
```

### Regras de dependência

1. `domain/` — não importa Next.js, React, Prisma, Groq ou UI.
2. `application/` — depende de contratos do domínio, nunca de implementação de infra.
3. Prisma fica em `infrastructure/`. Groq fica atrás de `LanguageModelProvider`.
4. Rotas validam com Zod → invocam casos de uso → formatam resposta.

## Funcionamento da IA — Assistente Virtual do Barista

O aplicativo inclui um assistente de IA que ajuda os usuários a descobrir combinações de café, queijo e vinho baseadas em preferências de paladar.

### Como funciona

1. **Entrada do usuário**: O usuário digita uma mensagem descrevendo suas preferências (ex: "gosto de cafés com corpo intenso e notas de chocolate", ou "queijo que combine com vinho tinto encorpado").

2. **Processamento no servidor** (`src/modules/assistant/`):
   - O caso de uso `AskVirtualBarista` consulta o `Catalog` e `Pairing` para obter dados reais
   - Monta um contexto minimizado com produtos/pares relevantes
   - Envia para a Groq API via `LanguageModelProvider` (único arquivo que importa o `groq-sdk` em `infrastructure/ai/groq-provider.ts`)

3. **Prompt construído**: O contexto inclui:
   - Perfis sensoriais dos produtos disponíveis
   - Sugestões de harmonização do serviço de pairing
   - Regra: "LLM nunca decide preço/disponibilidade"

4. **Validação de saída**: Os produtos citados pela IA são validados para garantir que existem no banco de dados antes de serem mostrados ao usuário.

5. **Fallback**: Se não houver `GROQ_API_KEY` configurada, o sistema usa respostas editoriais pré-definidas.

### Arquitetura da IA

```
┌─────────────────────────────────────────────────────────────┐
│                    Flow de Requisição                       │
├─────────────────────┬─────────────────────┬───────────────┤
│  Cliente (frontend) │  Route Handler      │  Groq API     │
│  POST /api/chat     │  AskVirtualBarista  │               │
│ ─►                  │ ─►                 │ ─► LLM Response│
│  message + history  │  catalog + pairing│               │
│                     │  deterministic     │               │
│                     │  validation        │               │
└─────────────────────┴─────────────────────┴───────────────┘
```

### Arquivos chave

- `src/modules/assistant/` — casos de uso do assistente
- `infrastructure/ai/groq-provider.ts` — adapter Groq (único arquivo com import do sdk)
- `src/lib/env.ts` — validação de `GROQ_API_KEY` (opcional)

## Evolução do Código


### Principais mudanças recentes

| Área | O que mudou |
|------|-------------|
| **Textos** | "demonstrativo" removido de descriptions, pages e toasts |
| **CSP** | `next.config.ts` adicionou `'unsafe-eval'` para dev |
| **IA** | Assistente Groq adicionado (Fase 7) |
| **Testes** | 107/107 testes passando |

### Histórico de commits relevantes

```
c8aac9c  libera unsafe-eval no CSP para o ambiente de desenvolvimento
c08ff71  remove badges e textos demonstrativos do catalogo e da loja
113ecbd  ajustes finos: seed com fallback de senha e env.example atualizado
df78709  remove legado y/legacy/firebase e aplica seguranca + duplicated code fixes
aec90e1  remove aviso do vite no vitest config e limpa gitignore
dd39c4c  adiciona testes e2e com playwright e refina componentes de interface
8e8aa53  adiciona descoberta por paladar e barista virtual (Groq)
c2c3df3  adiciona commerce demonstrativo e autenticacao
```

## Módulos Principais

### Catálogo (`catalog`)

- Listagem de produtos com filtros por categoria, intensidade, corpo, acidez
- Ficha individual com perfil sensorial completo
- Busca por paladar (questionário)

### Harmonização (`pairing`)

- Motor determinístico de pairing baseado em intensidade, corpo, acidez, textura
- API de recomendações por preferências
- Página de harmonizações com explicações editoriais

### Descoberta (`discovery`)

- Questionário de preferências de paladar
- Recomendações determinísticas baseadas em perfil de gosto
- API `POST /api/recommendations`

### Assistente (`assistant`)

- Chat com o Barista Virtual (Groq API)
- Recomendações baseadas em histórico e preferências
- Validação de saída para segurança

### Commerce (`commerce`)

- Carrinho demonstrativo (preços sempre do servidor)
- Planos de assinatura: Mensal, Coffee Lovers, Trimestral
- Finalização de pedido sem pagamento real

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `bun install` | Instalar dependências |
| `bun dev` | Servidor de desenvolvimento |
| `bun run typecheck` | Verificação TypeScript (`tsc --noEmit`) |
| `bun run lint` | Linting ESLint |
| `bun run test` | Executar testes (vitest — 107 testes) |
| `bun run build` | Build produção |
| `bun scripts/e2e.ts test` | Testes E2E com Playwright |

## Variáveis de Ambiente

Validadas via Zod em `src/lib/env.ts`:

- `DATABASE_URL` — PostgreSQL Neon (pooler)
- `DATABASE_URL_UNPOOLED` — para migrations
- `BETTER_AUTH_SECRET` — secreto da auth
- `BETTER_AUTH_URL` — URL da aplicação
- `GROQ_API_KEY` — opcional, para o assistente IA
- `NEXT_PUBLIC_APP_URL` — URL do app

## Licença

MIT © Maciel Douglas
