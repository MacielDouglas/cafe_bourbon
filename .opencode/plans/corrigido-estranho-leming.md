# Plano — Testes de ponta a ponta: páginas, navegação, rolagem, seleção, compra, IA, erros e acessibilidade

## Contexto (auditoria realizada)

O projeto **já possui** suíte robusta: 14 arquivos Vitest (unit) e 12 arquivos Playwright (`e2e/*.e2e.ts`, ~45 testes) cobrindo abertura das 10 rotas públicas, 404, overflow mobile, mega-menu, busca, âncoras, skip-link, filtros/ordenação/comparação do catálogo, ficha de produto, carrinho (quantidade/desfazer/esvaziar), kit, checkout autenticado, assinatura, chat IA com mocks (sucesso/falha/degradado), quiz com mocks (sucesso/vazio/falha), auth e admin.

**Lacunas reais identificadas** (foco deste plano — não duplicar o que já existe):

| Área | Lacuna |
|---|---|
| Acessibilidade | Só existe teste de skip-link. Zero varreduras automatizadas (axe-core) e quase nenhum teste de teclado/foco |
| Erros | Falhas de API no carrinho/checkout/assinatura/kit não testadas na UI (os `toast.error` do código nunca são exercitados) |
| Rolagem | Sticky asides (harmonizador, assinatura) e reset de scroll na navegação entre rotas não testados |
| IA | Pergunta real fora do escopo (rejeição determinística sem depender da Groq), clique em produto citado, conversa multi-turno, persona prevista durante loading, 429 na UI |
| Compra | Rascunho de assinatura em `sessionStorage` (sobrevive a reload), newsletter |
| Páginas | `/admin/produtos/novo` e `/admin/produtos/[id]` nunca abertos em teste |
| Seleção | Clique no resultado do quiz → ficha do produto |
| Unit | `assistant-topic.ts` (escopo/tópico) sem teste dedicado |

**Decisões do usuário:** instalar `@axe-core/playwright` (devDependency) e **corrigir todas** as violações axe encontradas no código da app (severidade alta, baixa ou mínima).

## Fases

### Fase 1 — Setup do axe-core
1. `bun add -d @axe-core/playwright`
2. Criar helper em `e2e/helpers.ts`:
   - `analyzeA11y(page)` → roda `AxeBuilder` com tags `wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice`, retorna violações.
   - `expectNoA11yViolations(page)` → falha o teste listando cada violação (id, impact, nós).
   - `failApi(page, pathname, status, body)` → helper genérico de mock de falha (reaproveita padrão do `failChat`).
3. Verificação: `bun run typecheck`.

### Fase 2 — Varreduras axe (`e2e/accessibility.e2e.ts`, novo)
Roteador `test.describe` por estado, tudo com `expectNoA11yViolations`:
1. **Rotas públicas**: `/`, `/produtos`, `/produtos/cafe-do-brasil`, `/harmonizacoes`, `/harmonizacoes?cafe=cafe-do-brasil`, `/descobrir`, `/barista`, `/carrinho`, `/assinatura`, `/entrar`, `/criar-conta`, 404 (`/rota-que-nao-existe`).
2. **Estados interativos**: diálogo de busca aberto; menu mobile aberto (viewport 390×844 via `test.use`); diálogo de conta aberto (logado); carrinho com 1 item; quiz com resultados (mock `mockRecommendations`); chat com mensagens (mock `mockChat`); comparação de produtos (`/produtos?comparar=...`); assinatura com plano selecionado.
3. **Admin** (com `login`): `/admin`, `/admin/produtos`, `/admin/produtos/novo`, `/admin/pedidos`.
4. **Executar e corrigir tudo**: rodar a suíte, coletar cada violação e corrigir no código da app (contraste de tokens no CSS do tema, labels, roles, ordem de foco etc.) até zerar. Re-rodar após cada rodada de correções.

### Fase 3 — Teclado, foco e live regions (mesmo arquivo)
1. Ordem de Tab no cabeçalho: skip-link → logo → links de navegação → busca → conta/carrinho (elementos focáveis na ordem visual).
2. `Esc` fecha o diálogo de busca e devolve o foco ao botão "Buscar produtos".
3. `Esc` fecha o menu mobile e devolve o foco ao botão "Abrir menu".
4. `Esc` fecha o diálogo da conta e devolve o foco ao botão "Minha conta".
5. Login submetido por `Enter` (teclado) no formulário.
6. Sliders do quiz operáveis com `ArrowLeft` além do `ArrowRight` já coberto; toggles com `aria-pressed` acionados via teclado.
7. RadioGroup de moagem na assinatura navega por setas.
8. Atributos de live region: `role="log"`/`aria-live` no chat ganha `aria-busy=true` durante loading; região `aria-live="polite"` dos resultados do quiz; `aria-current="page"` no link ativo (reforço onde ausente).
9. Foco visível: elemento focado por Tab no header tem `box-shadow`/`outline` ≠ none (assegura `focus-visible` ring).

### Fase 4 — Rolagem (estender `e2e/navigation.e2e.ts`)
1. Aside sticky do harmonizador permanece no viewport ao rolar a lista de pares (viewport 1280×900).
2. Aside sticky da assinatura permanece no viewport ao rolar o formulário.
3. Navegação para outra rota a partir do fim da página inicia com `scrollY ≈ 0` (reset de scroll do App Router).

### Fase 5 — Erros de API na UI (`e2e/errors.e2e.ts`, novo)
Usando `failApi`:
1. Falha no `POST /api/cart` → `toast.error("Não foi possível adicionar ao carrinho. Tente novamente.")`.
2. Falha no `PATCH /api/cart` → "Não foi possível atualizar o carrinho."
3. Falha no `DELETE /api/cart` (remover) → asserção do erro de remoção (ver texto exato no componente).
4. Falha no `POST /api/cart/kit` → "Não foi possível adicionar o kit."
5. Falha no `POST /api/checkout` (logado) → "Não foi possível concluir o pedido."
6. Falha no `POST /api/subscription` (logado) → "Não foi possível concluir a assinatura."
7. `429` do `/api/chat` → alerta de erro recuperável na UI (estende `assistant.e2e.ts`).

### Fase 6 — Compra e seleção (estender `commerce.e2e.ts`, `discovery.e2e.ts`, `navigation.e2e.ts`)
1. **Rascunho de assinatura**: selecionar plano + café → recarregar página → escolhas restauradas (`aria-pressed` persistido via `sessionStorage`); após confirmação bem-sucedida o rascunho é limpo.
2. **Newsletter** (rodapé): enviar e-mail → toast "Inscrição registrada!".
3. **Quiz**: clicar no resultado recomendado → abre a ficha `/produtos/[slug]`.

### Fase 7 — IA (estender `assistant.e2e.ts`)
1. **Fora do escopo via API real** (sem mock): "Que horas são?" → resposta degradação NÃO é invocada; assert de "Por aqui só converso sobre café, queijo e vinho do Café Bourbon". ⚠️ Respeitar rate-limit 10/min do `/api/chat`: usar `page.route` com `route.continue({ headers: { "x-forwarded-for": ip-única } })` para isolar o bucket por teste (mesma técnica já usada em `api.e2e.ts`).
2. **Produto citado clicável**: mock com `productSlugs` → clicar no link da resposta → abre `/produtos/[slug]` com h1 correto.
3. **Multi-turno**: 2 perguntas em sequência → as 4 bolhas (2 user + 2 assistant) aparecem em ordem no `role="log"`; input limpo após cada envio.
4. **Persona prevista durante loading**: rota com atraso (~800ms) → durante aguardo, a persona prevista (ex.: "Lorenzo Giovanni") está visível e `aria-busy="true"`; ao concluir, some.

### Fase 8 — Páginas admin e unit extras
1. `e2e/admin.e2e.ts`: abrir `/admin/produtos/novo` e `/admin/produtos/[id]` (h1 visível, sem erro de página).
2. Novo unit `src/modules/assistant/domain/assistant-topic.test.ts`: `detectAssistantTopic` (café/queijo/vinho/geral, desempate por primeira ocorrência), `isAssistantMessageInScope` (in-scope por gosto/comércio, off-topic recusado, tokens vazios recusados), `tokenizeAssistantMessage` (acentos, stopwords, tokens < 3).

### Fase 9 — Verificação final
1. `bun run typecheck`
2. `bun run lint`
3. `bun test`
4. `bun run test:e2e` (suíte completa, inclui webServer `bun dev`)
5. Relatório final: arquivos alterados, testes novos, verificações executadas, resultados e pendências (ex.: testes que dependem de `DATABASE_URL`/seed do Neon).

## Arquivos

**Novos:**
- `e2e/accessibility.e2e.ts` — axe (Fase 2) + teclado/foco (Fase 3)
- `e2e/errors.e2e.ts` — falhas de API na UI (Fase 5)
- `src/modules/assistant/domain/assistant-topic.test.ts` (Fase 8)

**Modificados:**
- `package.json` (+`@axe-core/playwright`)
- `e2e/helpers.ts` (helpers de a11y e falha de API)
- `e2e/navigation.e2e.ts` (rolagem, newsletter)
- `e2e/commerce.e2e.ts` (rascunho)
- `e2e/discovery.e2e.ts` (clique no resultado)
- `e2e/assistant.e2e.ts` (fora do escopo, produto citado, multi-turno, persona/loading, 429)
- `e2e/admin.e2e.ts` (abertura das páginas de produto)
- Código da app em `src/` conforme violações axe (Fase 2) — contraste, labels, roles, foco

## Riscos e mitigações

- **Rate-limit do chat (10/min por IP)**: isolar cada teste real com `x-forwarded-for` único via `route.continue` (técnica já usada em `api.e2e.ts`).
- **Volume de violações axe imprevisível**: fase 2 é iterativa; correções podem tocar tokens de tema/componentes — manter rodadas curtas e re-rodar o axe a cada correção.
- **E2E depende de DB (Neon) e dev server**: webServer já configurado em `playwright.config.ts`; suíte atual roda no ambiente, novos testes seguem os mesmos mocks/fixtures existentes.
- **Não duplicar**: nada reescreve os 45 testes atuais; apenas estende arquivos existentes.
