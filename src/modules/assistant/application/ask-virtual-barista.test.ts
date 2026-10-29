import { describe, expect, it } from "vitest";
import type { Product } from "@/modules/catalog/domain/product";
import type {
  PaginatedProducts,
  ProductFilter,
  ProductRepository,
} from "@/modules/catalog/domain/repository";
import { AskVirtualBarista } from "@/modules/assistant/application/ask-virtual-barista";
import type {
  LanguageModelProvider,
  LanguageModelRequest,
} from "@/modules/assistant/application/language-model-provider";
import { Pairing } from "@/modules/pairing/domain/pairing";
import type {
  PairingFilter,
  PairingRepository,
} from "@/modules/pairing/domain/repository";
import { createProduct } from "@/testing/product-factory";

class FakeProductRepository implements ProductRepository {
  constructor(private readonly items: Product[]) {}

  async list(filter: ProductFilter): Promise<PaginatedProducts> {
    const pageSize = filter.pageSize ?? 12;
    const filtered = this.items.filter((item) => {
      if (filter.type && item.type !== filter.type) return false;
      if (filter.availableOnly && !item.available) return false;
      return true;
    });
    return {
      items: filtered.slice(0, pageSize),
      total: filtered.length,
      page: 1,
      pageSize,
    };
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.items.find((item) => item.slug === slug) ?? null;
  }

  async findByIds(ids: readonly string[]): Promise<Product[]> {
    return this.items.filter((item) => ids.includes(item.id.value));
  }
}

class FakePairingRepository implements PairingRepository {
  constructor(private readonly items: Pairing[]) {}

  async listPublished(filter: PairingFilter): Promise<Pairing[]> {
    return this.items.filter(
      (pairing) =>
        !filter.productId || pairing.productIds.includes(filter.productId),
    );
  }
}

class FakeLanguageModelProvider implements LanguageModelProvider {
  readonly id = "fake";
  lastRequest: LanguageModelRequest | null = null;

  constructor(private readonly behavior: "reply" | "empty" | "throw", private readonly text = "") {}

  async generate(request: LanguageModelRequest): Promise<string> {
    this.lastRequest = request;
    if (this.behavior === "throw") throw new Error("boom");
    if (this.behavior === "empty") return "";
    return this.text;
  }
}

const brasil = createProduct({
  id: "coffee-brasil",
  type: "COFFEE",
  name: "Café do Brasil",
  slug: "cafe-do-brasil",
  profile: {
    kind: "COFFEE",
    origin: "Brasil",
    variety: null,
    process: null,
    roastLevel: 3,
    intensity: 3,
    acidity: 4,
    body: 4,
    notes: ["melado"],
    brewMethods: ["COADO"],
  },
});

const curado = createProduct({
  id: "cheese-curado",
  type: "CHEESE",
  name: "Queijo Curado",
  slug: "queijo-curado",
  profile: {
    kind: "CHEESE",
    milkType: "Vaca",
    style: "Curado",
    agingDays: 120,
    texture: "Dura",
    intensity: 4,
    acidity: 2,
    notes: ["aminoácidos"],
    origin: null,
  },
});

const encorpado = createProduct({
  id: "wine-encorpado",
  type: "WINE",
  name: "Tinto Encorpado",
  slug: "tinto-encorpado",
  profile: {
    kind: "WINE",
    grapes: ["Cabernet Sauvignon"],
    region: null,
    style: "Tinto encorpado",
    vintage: null,
    body: 5,
    acidity: 3,
    tannins: 5,
    notes: ["cassis", "cedro"],
    alcoholPct: 13.5,
  },
});

const editorialPairing = Pairing.create({
  id: "pair-brasil-curado",
  productIds: ["coffee-brasil", "cheese-curado"],
  origin: "EDITORIAL",
  score: 82,
  criteria: [
    { rule: "editorial-curation", points: 82, max: 100, detail: "Curadoria editorial de teste." },
  ],
  explanation: "Harmonização editorial de teste com justificativa suficiente.",
  published: true,
});

function createUseCase(provider: LanguageModelProvider | null, pairings = [editorialPairing]) {
  return new AskVirtualBarista(
    new FakeProductRepository([brasil, curado, encorpado]),
    new FakePairingRepository(pairings),
    provider,
  );
}

describe("AskVirtualBarista", () => {
  it("resolve produtos citados no texto do modelo", async () => {
    const result = await createUseCase(
      new FakeLanguageModelProvider("reply", "Recomendo o Café do Brasil com o Queijo Curado."),
    ).execute({ message: "monte uma experiência para mim" });

    expect(result.degraded).toBe(false);
    expect(result.productSlugs).toEqual(["cafe-do-brasil", "queijo-curado"]);
    expect(result.pairingIds).toEqual(["pair-brasil-curado"]);
  });

  it("inclui vinhos no contexto quando o cliente pede vinho", async () => {
    const provider = new FakeLanguageModelProvider(
      "reply",
      "Recomendo o Tinto Encorpado.",
    );
    const result = await createUseCase(provider).execute({
      message: "Quero uma sugestão de vinho",
    });

    expect(provider.lastRequest?.prompt).toContain("Tinto Encorpado");
    expect(provider.lastRequest?.prompt).toContain("Vinhos: 1");
    expect(result.productSlugs).toEqual(["tinto-encorpado"]);
  });

  it("recusa perguntas fora do catálogo sem chamar o modelo", async () => {
    const provider = new FakeLanguageModelProvider(
      "reply",
      "A capital da França é Paris.",
    );
    const result = await createUseCase(provider).execute({
      message: "Qual é a capital da França?",
    });

    expect(provider.lastRequest).toBeNull();
    expect(result.degraded).toBe(false);
    expect(result.productSlugs).toEqual([]);
    expect(result.persona.name).toBe("Casa Bourbon");
    expect(result.reply).toContain("só converso sobre café, queijo e vinho");
  });

  it("não deixa um pedido genérico abrir espaço para tema externo", async () => {
    const provider = new FakeLanguageModelProvider(
      "reply",
      "Aqui vai uma sugestão de filme.",
    );
    const result = await createUseCase(provider).execute({
      message: "Me dê uma sugestão de filme",
    });

    expect(provider.lastRequest).toBeNull();
    expect(result.persona.name).toBe("Casa Bourbon");
  });

  it.each([
    ["Quero um café especial", "Lorenzo Giovanni", "Barista", "sotaque italiano"],
    ["Me indique um vinho tinto", "Jean Pierre", "Sommelier", "sotaque francês"],
    ["Qual queijo combina com mel?", "Chico da Dona Zezé", "Queijista", "sotaque mineiro"],
  ])(
    "escala a persona certa para %s",
    async (message, name, role, accent) => {
      const provider = new FakeLanguageModelProvider("reply", "Recomendo uma opção da casa.");
      const result = await createUseCase(provider).execute({ message });

      expect(result.persona.name).toBe(name);
      expect(result.persona.role).toBe(role);
      expect(provider.lastRequest?.system).toContain("REGRA DE ESCOPO");
      expect(provider.lastRequest?.system).toContain(accent);
    },
  );

  it("reforça o vocabulário de cada sotaque no prompt", async () => {
    const cases = [
      {
        message: "Quero um café especial",
        words: [
          "culturale",
          "naturale",
          "escritore",
          "emozione",
          "operacione",
          "nacionale",
        ],
      },
      {
        message: "Me indique um vinho tinto",
        words: ["voilà", "magnifique", "terroir", "mon ami", "délicieux"],
      },
      {
        message: "Qual queijo combina com mel?",
        words: ["ocê", "uai", "trem", "sô", "tiquim", "bão", "nigucin"],
      },
    ] as const;

    for (const entry of cases) {
      const provider = new FakeLanguageModelProvider("reply", "Uma opção da casa.");
      await createUseCase(provider).execute({ message: entry.message });
      for (const word of entry.words) {
        expect(provider.lastRequest?.system).toContain(word);
      }
    }
  });

  it("mantém o sotaque nas respostas locais", async () => {
    const coffee = await createUseCase(null).execute({ message: "quero um café" });
    expect(coffee.reply).toContain("ecco");
    expect(coffee.reply).toContain("culturale");

    const wine = await createUseCase(null).execute({ message: "quero um vinho" });
    expect(wine.reply).toContain("voilà");
    expect(wine.reply).toContain("mon ami");

    const cheese = await createUseCase(null).execute({ message: "quero um queijo" });
    expect(cheese.reply).toContain("Uai");
    expect(cheese.reply).toContain("tiquim");
  });

  it("mantém as três categorias em pedidos genéricos", async () => {
    const provider = new FakeLanguageModelProvider(
      "reply",
      "Podemos começar com o Café do Brasil.",
    );
    await createUseCase(provider).execute({ message: "O que você recomenda?" });

    const prompt = provider.lastRequest?.prompt ?? "";
    expect(prompt).toContain("Cafés: 1");
    expect(prompt).toContain("Queijos: 1");
    expect(prompt).toContain("Vinhos: 1");
    expect(prompt).toContain("Café do Brasil");
    expect(prompt).toContain("Queijo Curado");
    expect(prompt).toContain("Tinto Encorpado");
  });

  it("inclui vinho e queijo ao montar uma harmonização", async () => {
    const provider = new FakeLanguageModelProvider(
      "reply",
      "Sugiro o Tinto Encorpado com o Queijo Curado.",
    );
    const result = await createUseCase(provider).execute({
      message: "Quero um vinho para acompanhar queijo curado",
    });

    const prompt = provider.lastRequest?.prompt ?? "";
    expect(prompt).toContain("Tinto Encorpado");
    expect(prompt).toContain("Queijo Curado");
    expect(result.productSlugs).toContain("tinto-encorpado");
    expect(result.productSlugs).toContain("queijo-curado");
  });

  it("não inventa produtos ausentes do contexto", async () => {
    const result = await createUseCase(
      new FakeLanguageModelProvider("reply", "Sugiro um chá verde gelado."),
    ).execute({ message: "quero uma sugestão de café" });

    expect(result.productSlugs).toEqual([]);
    expect(result.pairingIds).toEqual([]);
  });

  it("entra em modo degradado sem provider configurado", async () => {
    const result = await createUseCase(null).execute({
      message: "me ajude a escolher um café",
    });

    expect(result.degraded).toBe(true);
    expect(result.productSlugs.length).toBeGreaterThan(0);
    expect(result.reply).toContain("Café do Brasil");
  });

  it("entra em modo degradado quando o provider falha", async () => {
    const result = await createUseCase(new FakeLanguageModelProvider("throw")).execute({
      message: "quero um café",
    });
    expect(result.degraded).toBe(true);
  });

  it("trata resposta vazia do modelo como degradada", async () => {
    const result = await createUseCase(new FakeLanguageModelProvider("empty")).execute({
      message: "quero um café",
    });
    expect(result.degraded).toBe(true);
  });
});
