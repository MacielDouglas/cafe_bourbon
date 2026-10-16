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
const MAX_CONTEXT_PRODUCTS = 6;
const MAX_PAIRINGS = 3;
const MAX_MESSAGE = 1000;

const TYPE_LABEL: Record<ProductType, string> = {
  COFFEE: "Café",
  CHEESE: "Queijo",
  WINE: "Vinho",
};

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
  "Você é o barista virtual do Café Bourbon, uma cafeteria de cafés especiais, queijos e vinhos. " +
  "Responda em português do Brasil, em no máximo 4 frases, com tom acolhedor e direto. " +
  "Sugira APENAS produtos presentes no contexto fornecido, citando-os pelo nome. " +
  "Nunca invente preço, disponibilidade ou produtos que não estejam no contexto. " +
  "Se o contexto não cobrir a pergunta, oriente o cliente a explorar /descobrir ou /harmonizacoes.";

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

function relevance(product: Product, tokens: readonly string[]): number {
  if (tokens.length === 0) return 0;
  const name = normalize(product.name);
  const rest = normalize(
    [product.description, product.sensory.notes.join(" "), product.type].join(" "),
  );
  let score = 0;
  for (const token of tokens) {
    if (name.includes(token)) score += 3;
    if (rest.includes(token)) score += 1;
  }
  return score;
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
  return `- ${product.name} (${TYPE_LABEL[product.type]}, slug: ${product.slug}) — notas: ${notes}. ${price}.`;
}

export class AskVirtualBarista {
  constructor(
    private readonly products: ProductRepository,
    private readonly pairings: PairingRepository,
    private readonly provider: LanguageModelProvider | null,
  ) {}

  async execute(input: AskVirtualBaristaInput): Promise<BaristaReply> {
    const message = input.message.trim().slice(0, MAX_MESSAGE);
    const context = await this.retrieveContext(message);

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
        prompt: this.buildPrompt(message, context),
      });
      if (!reply) return this.degradedReply(context);
      return await this.finalize(reply, context, false);
    } catch {
      return this.degradedReply(context);
    }
  }

  private async retrieveContext(message: string): Promise<Product[]> {
    const tokens = tokenize(message);
    const pool: Product[] = [];
    for (const type of ALL_TYPES) {
      const page = await this.products.list({
        type,
        availableOnly: true,
        pageSize: MAX_TYPES_PAGE,
      });
      pool.push(...page.items);
    }
    const ranked = pool
      .map((product) => ({ product, score: relevance(product, tokens) }))
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
    const relevant = ranked.filter((entry) => entry.score > 0);
    const chosen = (relevant.length > 0 ? relevant : ranked).slice(
      0,
      MAX_CONTEXT_PRODUCTS,
    );
    return chosen.map((entry) => entry.product);
  }

  private buildPrompt(message: string, context: readonly Product[]): string {
    return [
      `Pergunta do cliente: ${message}`,
      "",
      "Produtos disponíveis (contexto):",
      ...context.map(describeProduct),
      "",
      "Responda sugerindo produtos do contexto pelo nome.",
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
