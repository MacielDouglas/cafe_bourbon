import { describe, expect, it } from "vitest";
import type { Product } from "@/modules/catalog/domain/product";
import type {
  PaginatedProducts,
  ProductFilter,
  ProductRepository,
} from "@/modules/catalog/domain/repository";
import { GetCalculatedPairings } from "@/modules/pairing/application/get-calculated-pairings";
import { PairingService } from "@/modules/pairing/domain/pairing-service";
import { createProduct } from "@/testing/product-factory";

class FakeProductRepository implements ProductRepository {
  constructor(private readonly items: Product[]) {}

  async list(filter: ProductFilter): Promise<PaginatedProducts> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 12;
    const filtered = this.items.filter((item) => {
      if (filter.type && item.type !== filter.type) return false;
      if (filter.availableOnly && !item.available) return false;
      return true;
    });
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
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

const baseCoffee = createProduct({
  id: "coffee-base",
  type: "COFFEE",
  slug: "coffee-base",
  profile: {
    kind: "COFFEE",
    origin: "Brasil",
    variety: null,
    process: null,
    roastLevel: 3,
    intensity: 3,
    acidity: 3,
    body: 3,
    notes: ["melado"],
    brewMethods: ["COADO"],
  },
});

const strongCheese = createProduct({
  id: "cheese-strong",
  type: "CHEESE",
  profile: {
    kind: "CHEESE",
    milkType: "Vaca",
    style: "Meia-cura",
    agingDays: 21,
    texture: "Semidura",
    intensity: 3,
    acidity: 3,
    notes: ["melado"],
    origin: null,
  },
});

const weakCheese = createProduct({
  id: "cheese-weak",
  type: "CHEESE",
  profile: {
    kind: "CHEESE",
    milkType: "Vaca",
    style: "Frescal",
    agingDays: 5,
    texture: "Fresca",
    intensity: 1,
    acidity: 1,
    notes: ["nozes"],
    origin: null,
  },
});

const otherCoffee = createProduct({
  id: "coffee-other",
  type: "COFFEE",
  profile: {
    kind: "COFFEE",
    origin: "Cuba",
    variety: null,
    process: null,
    roastLevel: 3,
    intensity: 3,
    acidity: 3,
    body: 3,
    notes: ["melado"],
    brewMethods: ["EXPRESSO"],
  },
});

const unavailableWine = createProduct({
  id: "wine-off",
  type: "WINE",
  available: false,
  profile: {
    kind: "WINE",
    grapes: ["Merlot"],
    region: null,
    style: "Tinto frutado",
    vintage: null,
    body: 3,
    acidity: 3,
    tannins: 3,
    notes: ["melado"],
    alcoholPct: 13,
  },
});

function useCase(items: Product[]) {
  return new GetCalculatedPairings(new FakeProductRepository(items), new PairingService());
}

describe("GetCalculatedPairings", () => {
  it("considera apenas tipos complementares e ignora o próprio produto", async () => {
    const results = await useCase([
      baseCoffee,
      strongCheese,
      otherCoffee,
      unavailableWine,
    ]).execute({ productId: "coffee-base" });

    const ids = results.map((entry) => entry.product.id.value);
    expect(ids).toContain("cheese-strong");
    expect(ids).not.toContain("coffee-base");
    expect(ids).not.toContain("coffee-other");
    expect(results.every((entry) => entry.product.type !== "COFFEE")).toBe(true);
  });

  it("filtra candidatos indisponíveis", async () => {
    const results = await useCase([baseCoffee, unavailableWine]).execute({
      productId: "coffee-base",
    });
    expect(results).toHaveLength(0);
  });

  it("ordena por score decrescente", async () => {
    const results = await useCase([baseCoffee, weakCheese, strongCheese]).execute({
      productId: "coffee-base",
    });
    expect(results.map((entry) => entry.product.id.value)).toEqual([
      "cheese-strong",
      "cheese-weak",
    ]);
    expect(results[0]!.calculation.score.value).toBeGreaterThan(
      results[1]!.calculation.score.value,
    );
  });

  it("respeita o limite pedido", async () => {
    const results = await useCase([baseCoffee, weakCheese, strongCheese]).execute({
      productId: "coffee-base",
      limit: 1,
    });
    expect(results).toHaveLength(1);
  });

  it("retorna vazio quando o produto base não existe", async () => {
    const results = await useCase([strongCheese]).execute({
      productId: "inexistente",
    });
    expect(results).toHaveLength(0);
  });
});
