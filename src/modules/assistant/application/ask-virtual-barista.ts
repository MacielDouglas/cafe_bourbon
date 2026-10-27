import type { Product } from "@/modules/catalog/domain/product";
import type { ProductRepository } from "@/modules/catalog/domain/repository";
import type { ProductType } from "@/modules/catalog/domain/value-objects";
import type { LanguageModelProvider } from "@/modules/assistant/application/language-model-provider";
import type { PairingRepository } from "@/modules/pairing/domain/repository";

export interface AskVirtualBaristaInput {
  message: string;
}

export interface BaristaReply {
  reply: string;
  productSlugs: string[];
  pairingIds: string[];
  degraded: boolean;
}

const ALL_TYPES: ProductType[] = ["COFFEE", "CHEESE", "WINE"];
const MAX_TYPES_PAGE = 50;
const MAX_CONTEXT_PRODUCTS = 10;
const BASE_PRODUCTS_PER_TYPE = 2;
const MAX_PAIRINGS = 3;
const MAX_MESSAGE = 1000;

const TYPE_LABEL: Record<ProductType, string> = {
  COFFEE: "Café",
  CHEESE: "Queijo",
  WINE: "Vinho",
};

const TYPE_KEYWORDS: Record<ProductType, readonly string[]> = {
  COFFEE: [
    "cafe",
    "cafes",
    "espresso",
    "expresso",
    "coado",
    "moka",
    "aeropress",
    "prensa",
    "grao",
    "graos",
    "arabica",
    "conilon",
    "torra",
  ],
  CHEESE: [
    "queijo",
    "queijos",
    "frescal",
    "curado",
    "maturado",
    "azul",
    "gorgonzola",
    "brie",
    "camembert",
    "parmesao",
  ],
  WINE: [
    "vinho",
    "vinhos",
    "tinto",
    "tintos",
    "branco",
    "brancos",
    "rose",
    "espumante",
    "espumantes",
    "cabernet",
    "merlot",
    "chardonnay",
    "sauvignon",
    "tannat",
    "syrah",
    "pinot",
    "malbec",
  ],
};

interface CatalogSnapshot {
  products: Product[];
  totals: Record<ProductType, number>;
}

const STOPWORDS = new Set([
  "para",
  "com",
  "sem",
  "que",
  "dos",
  "das",
  "uma",
  "um",
  "the",
  "and",
  "quero",
  "você",
  "voce",
  "meu",
  "minha",
  "sobre",
  "como",
  "qual",
  "quais",
  "preciso",
  "gosto",
  "algo",
]);

const SYSTEM_PROMPT =
  "Você é o barista virtual do Café Bourbon, uma casa de cafés especiais, queijos e vinhos. " +
  "Responda em português do Brasil, em no máximo 4 frases, com tom acolhedor e direto. " +
  "O contexto traz um resumo do catálogo disponível e uma amostra de produtos. " +
  "Sugira APENAS produtos da amostra, citando-os pelo nome, e nunca invente preço, disponibilidade ou produtos. " +
  "Nunca afirme que uma categoria está ausente quando o resumo indicar itens disponíveis. " +
  "Se o cliente pedir vinho, priorize os vinhos da amostra, incluindo tintos, brancos e espumantes. " +
  "Se faltar um produto específico, ofereça uma alternativa da mesma categoria e indique /produtos. " +
  "Para harmonizações, combine categorias diferentes presentes no contexto.";

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(message: string): string[] {
  return normalize(message)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function detectRequestedTypes(tokens: readonly string[]): ProductType[] {
  return ALL_TYPES.filter((type) =>
    TYPE_KEYWORDS[type].some((keyword) => tokens.includes(keyword)),
  );
}

function profileSummary(product: Product): string {
  const { profile } = product;
  switch (profile.kind) {
    case "COFFEE":
      return [
        profile.origin,
        `torra ${profile.roastLevel}/5`,
        `corpo ${profile.body}/5`,
        `acidez ${profile.acidity}/5`,
      ].join("; ");
    case "CHEESE":
      return [
        `leite ${profile.milkType}`,
        profile.style,
        profile.agingDays !== null ? `${profile.agingDays} dias de cura` : null,
        `intensidade ${profile.intensity}/5`,
      ]
        .filter((part): part is string => part !== null)
        .join("; ");
    case "WINE":
      return [
        `uvas ${profile.grapes.join(", ")}`,
        profile.style,
        `corpo ${profile.body}/5`,
        `acidez ${profile.acidity}/5`,
        profile.tannins !== null ? `taninos ${profile.tannins}/5` : null,
      ]
        .filter((part): part is string => part !== null)
        .join("; ");
  }
}

function relevance(
  product: Product,
  tokens: readonly string[],
  requestedTypes: readonly ProductType[],
): number {
  if (tokens.length === 0) return 0;
  const name = normalize(product.name);
  const rest = normalize(
    [
      product.description,
      profileSummary(product),
      product.sensory.notes.join(" "),
      TYPE_LABEL[product.type],
      ...TYPE_KEYWORDS[product.type],
    ].join(" "),
  );
  let score = requestedTypes.includes(product.type) ? 3 : 0;
  for (const token of tokens) {
    if (name.includes(token)) score += 3;
    if (rest.includes(token)) score += 1;
  }
  return score;
}

function selectContext(
  pool: readonly Product[],
  tokens: readonly string[],
  requestedTypes: readonly ProductType[],
): Product[] {
  const ranked = pool
    .map((product) => ({
      product,
      score: relevance(product, tokens, requestedTypes),
    }))
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));

  const targets = requestedTypes.length > 0 ? requestedTypes : ALL_TYPES;
  const quotas = new Map<ProductType, number>(
    ALL_TYPES.map((type) => [type, BASE_PRODUCTS_PER_TYPE] as const),
  );
  const extra = MAX_CONTEXT_PRODUCTS - BASE_PRODUCTS_PER_TYPE * ALL_TYPES.length;
  for (let index = 0; index < extra; index += 1) {
    const type = targets[index % targets.length];
    quotas.set(type, (quotas.get(type) ?? 0) + 1);
  }

  const order =
    requestedTypes.length > 0
      ? [...requestedTypes, ...ALL_TYPES.filter((type) => !requestedTypes.includes(type))]
      : ALL_TYPES;
  const selected: Product[] = [];
  const selectedIds = new Set<string>();
  const push = (product: Product) => {
    if (selected.length >= MAX_CONTEXT_PRODUCTS || selectedIds.has(product.id.value)) {
      return;
    }
    selectedIds.add(product.id.value);
    selected.push(product);
  };

  for (const type of order) {
    const quota = quotas.get(type) ?? 0;
    for (const entry of ranked
      .filter((candidate) => candidate.product.type === type)
      .slice(0, quota)) {
      push(entry.product);
    }
  }
  for (const entry of ranked) {
    push(entry.product);
  }

  return selected;
}

function brl(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function describeProduct(product: Product): string {
  const price = product.price ? brl(product.price.cents) : "preço sob consulta";
  const notes = product.sensory.notes.slice(0, 4).join(", ");
  return `- ${product.name} (${TYPE_LABEL[product.type]}, slug: ${product.slug}) — ${profileSummary(product)}; notas: ${notes}. ${price}.`;
}

export class AskVirtualBarista {
  constructor(
    private readonly products: ProductRepository,
    private readonly pairings: PairingRepository,
    private readonly provider: LanguageModelProvider | null,
  ) {}

  async execute(input: AskVirtualBaristaInput): Promise<BaristaReply> {
    const message = input.message.trim().slice(0, MAX_MESSAGE);
    const snapshot = await this.retrieveContext(message);
    const context = snapshot.products;

    if (context.length === 0) {
      return {
        reply:
          "Ainda não tenho produtos carregados para sugerir. Explore o catálogo em /produtos enquanto isso.",
        productSlugs: [],
        pairingIds: [],
        degraded: false,
      };
    }

    if (!this.provider) {
      return this.degradedReply(context);
    }

    try {
      const reply = await this.provider.generate({
        system: SYSTEM_PROMPT,
        prompt: this.buildPrompt(message, snapshot),
      });
      if (!reply) return this.degradedReply(context);
      return await this.finalize(reply, context, false);
    } catch {
      return this.degradedReply(context);
    }
  }

  private async retrieveContext(message: string): Promise<CatalogSnapshot> {
    const tokens = tokenize(message);
    const requestedTypes = detectRequestedTypes(tokens);
    const pages = await Promise.all(
      ALL_TYPES.map(async (type) => ({
        type,
        page: await this.products.list({
          type,
          availableOnly: true,
          pageSize: MAX_TYPES_PAGE,
        }),
      })),
    );
    const pool: Product[] = [];
    const totals: Record<ProductType, number> = {
      COFFEE: 0,
      CHEESE: 0,
      WINE: 0,
    };
    for (const { type, page } of pages) {
      totals[type] = page.total;
      pool.push(...page.items);
    }

    return {
      products: selectContext(pool, tokens, requestedTypes),
      totals,
    };
  }

  private buildPrompt(message: string, snapshot: CatalogSnapshot): string {
    return [
      `Pergunta do cliente: ${message}`,
      "",
      "Resumo do catálogo disponível:",
      `- Cafés: ${snapshot.totals.COFFEE}`,
      `- Queijos: ${snapshot.totals.CHEESE}`,
      `- Vinhos: ${snapshot.totals.WINE}`,
      "",
      "Amostra de produtos disponíveis (contexto):",
      ...snapshot.products.map(describeProduct),
      "",
      "Sugira produtos da amostra pelo nome. Se o produto exato pedido não estiver na amostra, ofereça uma alternativa da mesma categoria e indique /produtos para ver o catálogo completo.",
    ].join("\n");
  }

  private async finalize(
    reply: string,
    context: readonly Product[],
    degraded: boolean,
  ): Promise<BaristaReply> {
    const normalizedReply = normalize(reply);
    const mentioned = context.filter((product) =>
      normalizedReply.includes(normalize(product.name)),
    );
    const mentionedIds = new Set(mentioned.map((product) => product.id.value));

    let pairingIds: string[] = [];
    if (mentionedIds.size >= 2) {
      const published = await this.pairings.listPublished({ limit: 50 });
      pairingIds = published
        .filter(
          (pairing) =>
            pairing.productIds.length >= 2 &&
            pairing.productIds.every((id) => mentionedIds.has(id)),
        )
        .slice(0, MAX_PAIRINGS)
        .map((pairing) => pairing.id);
    }

    return {
      reply,
      productSlugs: mentioned.map((product) => product.slug),
      pairingIds,
      degraded,
    };
  }

  private degradedReply(context: readonly Product[]): BaristaReply {
    const highlight = context.slice(0, 3).map((product) => product.name);
    const suggestion =
      highlight.length > 0
        ? `Enquanto isso, uma boa pedida: ${highlight.join(", ")}.`
        : "";
    return {
      reply:
        `Estou sem minha conexão com a IA agora, mas posso adiantar o que temos por aqui. ` +
        `${suggestion} Para uma seleção sob medida use /descobrir, e para combinações veja /harmonizacoes.`,
      productSlugs: context.slice(0, 3).map((product) => product.slug),
      pairingIds: [],
      degraded: true,
    };
  }
}
