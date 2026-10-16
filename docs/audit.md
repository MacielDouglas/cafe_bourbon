# Auditoria — Café Bourbon (projeto legado)

Data: 2026-10-16 · Branch auditada: `copia` (idêntica a `main`) · Site público: https://cafe-bourbon.web.app/ (acessível, idêntico ao local).

## 1. Inventário

| Item | Encontrado |
|---|---|
| Páginas | `index.html`, `cafes.html`, `cafebrasil.html`, `cafecolombia.html`, `cafecubano.html`, `cafepapua.html`, `assinatura.html`, `contato.html`, `inscreva.html` |
| Estilos | `bootstrap-5.2.2-dist/` vendored + `css/styles.css` (64 linhas) + `css/style.css` |
| JS | `js/script.js` (15 linhas, função `updates()`) |
| Imagens | 7 arquivos em `img/`: `CafedoBrasil.jpg`, `CafeCubano.jpg`, `CafePapua.jpg`, `cafe_colombiano.jpg`, `cafe_preparo.jpg`, `cafe_rosquinha.jpg`, `endereco.jpg` + `img/icones/*.svg` |
| Config | `firebase.json` (`public: y`), `.firebaserc` (projeto `cafe-bourbon`), `.gitignore` ignora `.firebase`, `y`, `firebase.json` |
| Backend/banco | Nenhum. Sem `package.json`, sem TS, sem ORM, sem API |

## 2. Conteúdo real (preservar)

- **4 cafés** com descritivos sensoriais próprios: Brasil (doçura alta, corpo aveludado, acidez cítrica; pitanga/chá preto/curau), Cubano (corpo macio, acidez cítrica elegante; caramelo/frutas negras/rapadura), Papua Nova Guiné (adocicado, corpo leve; framboesa/pêssego), Colombiano Medellín (acidez cítrica+málica, melado; frutas amarelas/tangerina/nozes/especiarias).
- **6 métodos de preparo**: grãos, expresso, coado, moka, french press, aeropress.
- **Assinaturas**: Mensal R$90 (1 kg), Coffee Lovers R$120 (1 kg + 500 g surpresa), Trimestral R$270 (3,5 kg).
- **Venda pontual** (só em `cafebrasil.html`): 250 g R$20 / 500 g R$38 / 1 kg R$72.
- **Institucional**: `contato@bourboncafes.com`, Franca-SP, citação Frank Sinatra.
- **Queijos/vinhos**: ZERO dados e ZERO imagens — serão dados demonstrativos novos.

## 3. Problemas

1. Copy-paste massivo de navbar/footer entre as 9 páginas; HTML inválido (`width="318" height="400` sem aspas em `cafes.html:114`); `title` genérico "Document".
2. `updates()` frágil; IDs duplicados (`input_Mensal` repetido 3x em `assinatura.html`); botões com `href=""` (compra/assinatura sem ação real).
3. `inscreva.html` coleta CPF + dados de cartão sem backend — **não replicar**; risco LGPD/PCI.
4. Acessibilidade: `alt` vazios/duplicados, carrossel com `id` duplicado, sem foco visível, sem `label` consistente.
5. Perf: Bootstrap vendored (~200 KB+) + imagens sem otimização; sem SEO (sem meta description, sem OG).
6. FAQ em `contato.html` com seção vazia; links quebrados (`acessórios.html`, `inscricao.html` inexistentes).

## 4. Decisões de migração

- Manter: nome, 4 cafés + textos, métodos de preparo, contato, 7 imagens de café.
- Descartar: Bootstrap vendored, `js/script.js`, coleta de cartão, FAQ vazia.
- Legado será movido para `legacy/` como referência (branch `main` preserva o original).
- Queijos/vinhos: seed demonstrativo, campo `isDemoData=true`; imagens via placeholder até o usuário enviar as reais.
