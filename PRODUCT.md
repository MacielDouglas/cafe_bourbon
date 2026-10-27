# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Comprador de café especial (primário):** quer escolher grãos com confiança, comparando origem, perfil sensorial, intensidade e método de preparo antes de comprar.
- **Explorador de harmonizações (primário):** quer combinar café com queijo ou vinho e entender por que a combinação funciona.
- **Comprador de presente/kit (primário):** quer montar um kit para outra pessoa com pouca informação prévia sobre preferências.

Assinatura é um fluxo secundário já implementado (planos Mensal, Coffee Lovers e Trimestral), não um público primário confirmado.

## Product Purpose

Demonstração técnica e de portfólio que moderniza a marca Café Bourbon em uma experiência web de café especial. O produto existe para provar arquitetura e craft: monólito modular DDD, UI consistente e acessível, e mecanismos de recomendação explicáveis. Sucesso nesta versão é demonstrar essa qualidade, não operar uma loja real.

## Positioning

Uma vitrine de café especial que torna visível o porquê de cada recomendação: harmonização determinística com pesos auditáveis, descoberta por perfil sensorial e barista com IA restrito ao catálogo verificado. A posição é de demonstração de engenharia de produto e craft de interface sobre uma marca existente — não de e-commerce em operação.

## Operating Context

- Site público em português do Brasil, usado em desktop e mobile.
- Sessões típicas: navegar o catálogo, filtrar por tipo/perfil, consultar harmonizações, responder ao questionário de descoberta, conversar com o barista virtual, montar carrinho, ver planos de assinatura e (em contexto administrativo) gerenciar produtos.
- Conteúdo factual herdado do site legado: quatro cafés com descritivos sensoriais, seis métodos de preparo, contato e localização em Franca-SP.
- Queijos e vinhos são dados demonstrativos; imagens reais serão fornecidas pelo usuário.
- Não há checkout, pagamento ou cobrança reais nesta versão.

## Capabilities and Constraints

- **Catálogo:** quatro cafés reais (Brasil, Cubano, Papua Nova Guiné, Colombiano Medellín), seis métodos de preparo, perfis sensoriais e filtros. Queijos e vinhos são seed demonstrativo com `isDemoData=true`.
- **Preços e planos demonstrativos:** café 250 g R$ 20 / 500 g R$ 38 / 1 kg R$ 72; assinaturas Mensal R$ 90, Coffee Lovers R$ 120 e Trimestral R$ 270. Mantidos como valores demonstrativos, sem cobrança.
- **Harmonização:** motor determinístico com pesos e critérios explicáveis; o score é heurística do sistema, nunca verdade científica.
- **Descoberta:** questionário de perfil de sabor com recomendação determinística e fallback editorial.
- **Assistente:** Groq somente no servidor, atrás de `LanguageModelProvider`, com fallback útil sem chave. O modelo nunca define preço ou disponibilidade.
- **Commerce:** carrinho com preço sempre calculado no servidor; assinatura persistida; sem pagamento real.
- **Auth:** Better Auth com email/senha e áreas administrativas protegidas.
- **Stack existente:** Next.js App Router, React, TypeScript estrito, Bun, Tailwind CSS v4, shadcn/BaseUI, Prisma 7 + Neon, Better Auth, Zod e Vitest.
- **Proibições:** nunca coletar cartão/CPF, nunca expor segredos ao cliente e nunca apresentar dado demonstrativo como real.

## Brand Commitments

- Nome **Café Bourbon** preservado.
- **Nova voz editorial:** o conteúdo legado serve como referência factual, não como texto a ser copiado literalmente. A citação de Frank Sinatra não é compromisso e pode ser removida ou substituída.
- Contato e localização factuais: `contato@bourboncafes.com`, Franca-SP.
- Nomes e descrições sensoriais dos quatro cafés são fatos do produto e devem ser preservados em substância ao reescrever a forma.

## Evidence on Hand

- Descrições sensoriais e perfis dos quatro cafés em `prisma/seed.ts` e no conteúdo legado em `legacy/*.html`.
- Imagens de café em `public/images/` (quatro produtos, preparo, rosquinha e endereço) e ícones de métodos em `legacy/img/icones/`.
- Imagens genéricas `public/images/queijos.jpg` e `public/images/vinhos.jpg`; não há fotos reais de queijos ou vinhos.
- Contato e cidade reais do legado.
- **Ausências que não devem ser preenchidas por invenção:** depoimentos, clientes, imprensa, benchmarks, prêmios, números de vendas e catálogo real de queijos/vinhos.

## Product Principles

1. **Explicar, não impressionar:** toda recomendação mostra os critérios que a produziram.
2. **A demo não finge operação real:** dados demonstrativos são identificáveis e não há pagamento.
3. **Craft é o produto:** arquitetura DDD, acessibilidade AA e consistência de UI são critérios de sucesso, não acabamento opcional.
4. **Servidor é a fonte da verdade:** preço, disponibilidade e produtos citados nunca vêm do cliente nem do LLM.
5. **Preservar o café real, sinalizar o demonstrativo:** os quatro cafés e seus fatos permanecem; queijos e vinhos são explicitamente demo.

## Accessibility & Inclusion

WCAG 2.1 AA como requisito verificável: contraste, foco visível, navegação por teclado, labels consistentes, semântica e alternativas textuais.
