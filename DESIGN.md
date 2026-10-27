---
name: Café Bourbon
description: Casa de café especial com curadoria editorial, harmonizações explicáveis e uma interface quente, tátil e precisa.
colors:
  espresso: "oklch(0.2 0.014 55)"
  creme: "oklch(0.976 0.01 82)"
  card: "oklch(0.986 0.008 82)"
  bordo: "oklch(0.42 0.13 27)"
  muted-foreground: "oklch(0.47 0.016 62)"
  border: "oklch(0.886 0.013 76)"
  paper-raised: "oklch(0.945 0.014 78)"
  muted: "oklch(0.952 0.011 80)"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: "2.25rem"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: "1.75rem"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: "1rem"
    letterSpacing: "0.18em"
rounded:
  sm: "0.3rem"
  md: "0.4rem"
  lg: "0.5rem"
  xl: "0.7rem"
  2xl: "0.9rem"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
  "20": "80px"
components:
  button-primary:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.creme}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
    shadow: "0 10px 30px oklch(0.2 0.014 55 / 8%)"
  button-outline:
    backgroundColor: "{colors.creme}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.espresso}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "40px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.xl}"
    padding: "20px"
    shadow: "0 10px 30px oklch(0.2 0.014 55 / 8%)"
  chip-active:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.creme}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "40px"
  chip-outline:
    backgroundColor: "{colors.creme}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
---

# Design System: Café Bourbon

## Overview

**Creative North Star: "A Casa Bourbon"**

O sistema foi implementado em todas as superfícies públicas e administrativas. A Casa Bourbon é quente e tátil: papel de linho levemente amanteigado, tinta espresso, bordô raro, fotografia como cor principal e profundidade suave em superfícies estruturais. A precisão técnica continua visível nos detalhes — escalas sensoriais, critérios explicáveis, estados de erro claros —, mas sem a frieza de um dashboard.

A hospitalidade é contida. A interface quase desaparece para a foto e o produto conduzirem; cada rótulo, escala e critério permanece legível e explicável. Não há kickers decorativos acima de títulos: a hierarquia vem de tamanho, peso e espaço. O bordô é a única voz cromática da marca; o resto é papel, tinta e fumaça.

**Key Characteristics:**

- Papel quente e espresso como base; nenhum branco puro ou preto puro.
- Bordô como acento raro: links, escalas, estado ativo e foco de marca.
- Fotografia em cheio como principal fonte de cor e apetite.
- Neo-grotesca calma, com hierarquia por tamanho e peso — nunca por eyebrow.
- Grade contida em `max-w-7xl`, muito respiro vertical e ritmo editorial.
- Elevação suave em cards, popovers e estados; superfícies interativas elevam no hover.
- Controles táteis: 40px padrão, 44px em ações primárias, foco visível de 2–3px.
- Sem cards aninhados; divisores e superfícies tonais organizam o conteúdo.

## Colors

Paleta de adega e linho: neutros quentes de papel, tinta escura e um vinho profundo que nunca cobre grandes áreas.

### Primary

- **Espresso de Tinta** (`oklch(0.2 0.014 55)`): texto, botões primários, barra de anúncio e faixas de CTA. É o "preto" do sistema, sempre quente.
- **Creme de Linho** (`oklch(0.976 0.01 82)`): fundo padrão, texto sobre espresso e base de superfícies. Funciona como papel, não como branco.

### Secondary

- **Bordô de Adega** (`oklch(0.42 0.13 27)`): único acento de marca. Marca links, foco de seção, barras de escala, preços em destaque e o sublinhado da navegação ativa. Não preenche cards, faixas ou grandes blocos.

### Neutral

- **Papel de Carta** (`oklch(0.986 0.008 82)`): superfície de cards, popovers e estados vazios.
- **Papel Elevado** (`oklch(0.945 0.014 78)`): faixas secundárias, rodapé, chips e estados de hover.
- **Névoa de Papel** (`oklch(0.952 0.011 80)`): muted para fundos discretos e preenchimentos de controle.
- **Fumaça de Papel** (`oklch(0.47 0.016 62)`): texto secundário, legendas e metadados.
- **Fio de Linho** (`oklch(0.886 0.013 76)`): bordas de 1px, divisores e contornos de input.

### Named Rules

**The Rare Wine Rule.** O bordô é usado em menos de 10% de qualquer tela. Sua raridade é o que o mantém como assinatura; se ele virar fundo de bloco, o sistema perde a voz.

## Typography

**Display Font:** Geist (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Geist (with ui-sans-serif, system-ui, sans-serif)
**Label Font:** Geist em caixa alta com tracking largo, reservada a metadados e especificações. Geist Mono fica para dados técnicos.

**Character:** Uma neo-grotesca sóbria e contemporânea. A personalidade vem da escala contida, do peso médio e da fotografia — não de caixa alta decorativa acima de títulos.

### Hierarchy

- **Display** (500, 3.75rem/1, -0.025em): apenas o hero da home e aberturas de alto impacto.
- **Headline** (500, 1.875rem/2.25rem, -0.025em): títulos de seção (`h2`), com respiro generoso acima e abaixo.
- **Title** (500, 1.25rem/1.75rem): títulos de card, nomes de produto e subtítulos de bloco.
- **Body** (400, 1rem/1.5rem): parágrafos e descrições; textos longos ficam em `max-w-prose`.
- **Label** (500, 0.6875rem/1rem, 0.18em, uppercase): metadados, especificações e rótulos de escala. Nunca use como kicker acima de um título.

### Named Rules

**The No Kicker Rule.** Não existe eyebrow, kicker ou micro-label acima de `h1`, `h2` ou `h3`. O título começa a seção; qualquer contexto vem depois dele, ou dentro do próprio título.

**The Metadata Label Rule.** Caixa alta e tracking de 0.18em são reservados a metadados curtos — tipo de produto, especificações, labels de rodapé e cabeçalhos de tabela. Nunca carregam frases inteiras nem decoram abertura de seção.

## Layout

A grade é contida e centralizada em `max-w-7xl` (1280px), com padding horizontal de 16px no mobile, 24px em `sm` e 32px em `lg`. Seções usam ritmo vertical de 80px (`py-20`), chegando a 112px (`lg:py-28`) em aberturas editoriais; o rodapé abre 96px (`mt-24`) antes da borda superior.

O cabeçalho é `sticky` com 72px de altura, precedido por uma barra de anúncio com texto de 12px em caixa alta. A navegação desktop entra em `lg` (1024px); abaixo disso, o menu móvel assume. As coleções ficam dentro do mega-menu "Catálogo" para preservar respiro. O conteúdo respira em colunas de 1, 2, 3 ou 4 itens, com `gap` de 20px entre cards e 40px entre blocos de processo. Breakpoints seguem o padrão Tailwind: `sm` 640px, `md` 768px, `lg` 1024px e `xl` 1280px.

A densidade é intencionalmente arejada: imagens grandes, títulos com `text-balance` e poucos elementos por viewport. Em telas pequenas, as grades caem para uma ou duas colunas sem perder o ritmo.

## Elevation & Depth

Profundidade é estrutural, não decorativa. Cards, popovers, estados vazios e superfícies interativas usam duas sombras ambientes quentes:

- `--shadow-soft`: `0 1px 2px oklch(0.2 0.014 55 / 6%), 0 10px 30px oklch(0.2 0.014 55 / 8%)`.
- `--shadow-lift`: `0 2px 4px oklch(0.2 0.014 55 / 8%), 0 18px 48px oklch(0.2 0.014 55 / 14%)`.

O estado padrão é `shadow-soft`; `shadow-lift` aparece apenas em hover de cards clicáveis, popovers e seleção de plano. O cabeçalho usa `backdrop-blur` e borda de 1px, sem sombra pesada. Divisores de 1px continuam organizando listas e tabelas.

### Named Rules

**The Soft Surface Rule.** Toda superfície elevada usa sombra ambiente quente e fio de 1px. Não use sombras duras, brilhos, vidro fora do cabeçalho ou elevação em elementos puramente textuais.

**The No Nested Cards Rule.** Um card não contém outro card. Dentro de um card, organize com divisores, chips sem borda e superfícies tonais — nunca com uma segunda caixa elevada.

## Shapes

O sistema usa cantos discretos: 8px em botões, inputs e controles; 11.2px (`rounded-xl`) em cards, mídia e mensagens; 14.4px (`rounded-2xl`) em painéis editoriais, cards de harmonização e estados; e `9999px` em pills, filtros, notas sensoriais e CTAs editoriais. Bordas têm 1px e nunca são ornamentais.

Fotografias dominam retângulos: `aspect-square` em produtos e `aspect-4/3` em blocos editoriais, sempre com `object-cover`, cantos arredondados e sombra suave. Não há recortes diagonais, formas decorativas ou geometria de marca além do wordmark.

## Components

### Buttons

- **Shape:** 8px (`rounded-lg`); altura 40px padrão, 36px em `sm`, 44px em `lg`; ícones de 16px.
- **Primary:** espresso, texto creme, padding horizontal de 16px, peso 500 e `shadow-soft`. No hover, espresso a 90% e `shadow-lift`; no active, desloca 1px.
- **Outline:** fundo papel, borda de 1px `border`, texto espresso; hover em muted/papel elevado.
- **Secondary / Ghost:** fundo papel elevado ou transparente; usados em ações auxiliares.
- **CTAs editoriais:** links de hero e fechamento usam pill completo (`rounded-full`), altura mínima de 44px e foco em anel claro sobre fotografia.
- **Focus:** anel de 2–3px em `ring/50–60`; nunca remova o foco visível.

### Chips

- **Filter pill ativo:** espresso, texto creme, pill completo, `min-h-10`, padding horizontal de 20px e `shadow-soft`.
- **Filter pill inativo:** card sobre borda de 1px, texto espresso a 70%; hover em papel elevado.
- **Sensory note / sugestão:** pill de 36px, borda de 1px e `text-xs`; comunica nota ou atalho sem competir com botões.

### Cards / Containers

- **Corner Style:** 11.2px (`rounded-xl`); painéis editoriais e de harmonização usam 14.4px (`rounded-2xl`).
- **Background:** papel de carta sobre fundo creme, com fio de 1px em foreground a 10%.
- **Shadow Strategy:** `shadow-soft` por padrão; `shadow-lift` apenas em hover de cards interativos.
- **Internal Padding:** 20px padrão; 16px em cards compactos.
- **Product card:** coluna sem caixa externa; mídia quadrada em `rounded-xl` com `shadow-soft`, nome, subtítulo, preço e tipo na mesma linha de metadados. O nome fica bordô no hover. O tipo nunca aparece como eyebrow.
- **Nested cards:** proibidos. Use divisores, chips tonais e listas.

### Inputs / Fields

- **Style:** altura 40px, fundo transparente no claro e `input/30` no escuro, borda de 1px `input`, cantos de 8px, texto de 16px no mobile e 14px no desktop. Textarea começa em 112px.
- **Focus:** borda em `ring` e anel externo de 3px em `ring/50`.
- **Error / Disabled:** borda e anel destrutivos; desabilitado com fundo `input/50` e opacidade 50%.
- **Checkboxes / radios:** alvo mínimo de 36px no rótulo, foco em `focus-within` e acento bordô.

### Navigation

O topo combina barra de anúncio espresso com texto creme de 12px em caixa alta e tracking de 0.14em, seguida de cabeçalho creme de 72px com blur. Links de desktop usam 14px em foreground a 70%; o ativo fica em peso 500, bordô, com sublinhado de 2px. O mega-menu usa papel de carta, 32px de padding e `shadow-lift`. O rodapé organiza quatro colunas em papel elevado, com labels de metadados e links de 36px mínimos que ficam bordô no hover.

### Sensory Scale (signature)

A escala sensorial é o componente-assinatura: cinco segmentos de 28px por 6px, pill completo, preenchidos em bordô e vazios em `border`. Ela aparece sob o título "Perfil sensorial" e transforma intensidade, corpo e acidez em leitura imediata, sempre acompanhada de texto acessível.

### State Message

Mensagens de erro e vazio usam papel de carta, fio de 1px, cantos de 14.4px, padding de 64px por 32px e conteúdo centralizado, com `shadow-soft`. Título de 20px e descrição de 14px em fumaça de papel mantêm o tom calmo mesmo em falha. Não há eyebrow.

## Do's and Don'ts

### Do:

- **Do** manter creme, espresso e bordô como base; a cor real vem da fotografia.
- **Do** usar `shadow-soft` como elevação padrão e `shadow-lift` apenas em interação.
- **Do** elevar controles para 40px e ações primárias para 44px, mantendo WCAG 2.1 AA.
- **Do** garantir foco visível em todo elemento interativo.
- **Do** achatar conteúdo aninhado com divisores e chips sem borda.
- **Do** usar pill completo em filtros, notas e CTAs editoriais.
- **Do** deixar o título abrir a seção; contexto vem depois.
- **Do** preservar a fotografia como principal fonte de cor e apetite.

### Don't:

- **Don't** usar eyebrow, kicker ou micro-label acima de títulos.
- **Don't** aninhar cards.
- **Don't** preencher grandes áreas com bordô; ele é acento, não fundo.
- **Don't** usar branco puro, preto puro ou dourado.
- **Don't** introduzir gradientes que não sejam sobreposição sobre fotografia.
- **Don't** usar sombras pesadas, brilhos ou vidro fosco fora do cabeçalho.
- **Don't** parecer e-commerce genérico: nada de banners promocionais coloridos.
- **Don't** parecer dashboard SaaS: nada de KPIs decorativos, gráficos de enfeite ou azul de produto.
