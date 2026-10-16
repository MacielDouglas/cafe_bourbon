import { describe, expect, it } from "vitest";
import type { Product } from "@/modules/catalog/domain/product";
import type {
  PaginatedProducts,
  ProductFilter,
  ProductRepository,
} from "@/modules/catalog/domain/repository";
import { AskVirtualBarista } from "@/modules/assistant/application/ask-virtual-barista";
import type { LanguageModelProvider } from "@/modules/assistant/application/language-model-provider";
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
  constructor(private readonly behavior: "reply" | "empty" | "throw", private readonly text = "") {}

  async generate(): Promise<string> {
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

function useCase(provider: LanguageModelProvider | null, pairings = [editorialPairing]) {
  return new AskVirtualBarista(
    new FakeProductRepository([brasil, curado]),
    new FakePairingRepository(pairings),
    provider,
  );
}

describe("AskVirtualBarista", () => {
  it("resolve produtos citados no texto do modelo", async () => {
    const result = await useCase(
      new FakeLanguageModelProvider("reply", "Recomendo o Café do Brasil com o Queijo Curado."),
    ).execute({ message: "monte uma experiência para mim" });

    expect(result.degraded).toBe(false);
    expect(result.productSlugs).toEqual(["cafe-do-brasil", "queijo-curado"]);
    expect(result.pairingIds).toEqual(["pair-brasil-curado"]);
  });

  it("não inventa produtos ausentes do contexto", async () => {
    const result = await useCase(
      new FakeLanguageModelProvider("reply", "Sugiro um chá verde gelado."),
    ).execute({ message: "quero uma bebida" });

    expect(result.productSlugs).toEqual([]);
    expect(result.pairingIds).toEqual([]);
  });

  it("entra em modo degradado sem provider configurado", async () => {
    const result = await useCase(null).execute({ message: "me ajude a escolher" });

    expect(result.degraded).toBe(true);
    expect(result.productSlugs.length).toBeGreaterThan(0);
    expect(result.reply).toContain("Café do Brasil");
  });

  it("entra em modo degradado quando o provider falha", async () => {
    const result = await useCase(new FakeLanguageModelProvider("throw")).execute({
      message: "oi",
    });
    expect(result.degraded).toBe(true);
  });

  it("trata resposta vazia do modelo como degradada", async () => {
    const result = await useCase(new FakeLanguageModelProvider("empty")).execute({
      message: "oi",
    });
    expect(result.degraded).toBe(true);
  });
});
