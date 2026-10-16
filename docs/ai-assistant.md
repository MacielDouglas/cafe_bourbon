# Assistente virtual (Groq) — contrato e segurança

## Fluxo
1. `POST /api/chat` valida `{ message: string(1–1000) }` com Zod + rate-limit (10 req/min/IP, em memória).
2. Caso de uso `AskVirtualBarista`: busca produtos/pairings relevantes via casos de uso controlados (top-N por palavra-chave), monta contexto mínimo (nome, tipo, 3 atributos, preço se disponível).
3. `LanguageModelProvider.generate(prompt)` (adaptador `groq-sdk`, modelo centralizado em `src/infrastructure/ai/config.ts`, ex. `llama-3.3-70b-versatile`) gera texto.
4. Pós-validação: extrai menções a produtos e resolve contra o banco; IDs/URLs do modelo nunca são confiáveis sem verificação.
5. Resposta tipada `{ reply, productSlugs[], pairingIds[], degraded: boolean }`.

## Segurança
- `GROQ_API_KEY` só no servidor. Sem chave ⇒ `degraded=true` com resposta útil (top produtos + link para `/descobrir`).
- Modelo nunca é fonte de preço/disponibilidade; nunca executa SQL; timeout 15 s; log sem mensagem do usuário nem chave.
- Sem histórico persistente nesta versão.

## Teste pendente
Integração real com a Groq exige `GROQ_API_KEY` do usuário; até lá, testes usam `FakeLanguageModelProvider` determinístico.
