import { describe, expect, it } from "vitest";
import type { Product } from "@/modules/catalog/domain/product";
import type {
  PaginatedProducts,
  ProductFilter,
  ProductRepository,
} from "@/modules/catalog/domain/repository";
import { RecommendProductsFromPreferences } from "@/modules/discovery/application/recommend-products-from-preferences";
import { DiscoveryService } from "@/modules/discovery/domain/discovery-service";
import type { TasteProfile } from "@/modules/discovery/domain/taste-profile";
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

const lightCoffee = createProduct({
  id: "coffee-light",
  type: "COFFEE",
  priceCents: 2000,
  profile: {
    kind: "COFFEE",
    origin: "Papua Nova Guiné",
    variety: null,
    process: null,
    roastLevel: 2,
    intensity: 1,
    acidity: 3,
    body: 2,
    notes: ["framboesa", "pêssego"],
    brewMethods: ["COADO"],
  },
});

const strongCoffee = createProduct({
  id: "coffee-strong",
  type: "COFFEE",
  priceCents: 2600,
  profile: {
    kind: "COFFEE",
    origin: "Cuba",
    variety: null,
    process: null,
    roastLevel: 4,
    intensity: 5,
    acidity: 4,
    body: 5,
    notes: ["caramelo", "rapadura"],
    brewMethods: ["EXPRESSO"],
  },
});

const cheese = createProduct({
  id: "cheese-soft",
  type: "CHEESE",
  priceCents: 2400,
  profile: {
    kind: "CHEESE",
    milkType: "Vaca",
    style: "Meia-cura",
    agingDays: 21,
    texture: "Semidura",
    intensity: 2,
    acidity: 3,
    notes: ["manteiga", "nozes"],
    origin: null,
  },
});

const priceyWine = createProduct({
  id: "wine-pricey",
  type: "WINE",
  priceCents: 68000,
  profile: {
    kind: "WINE",
    grapes: ["Cabernet Sauvignon"],
    region: null,
    style: "Tinto encorpado",
    vintage: null,
    body: 5,
    acidity: 3,
    tannins: 5,
    notes: ["caramelo"],
    alcoholPct: 13.5,
  },
});

const profile: TasteProfile = {
  intensity: 1,
  acidity: 3,
  body: 2,
  notes: ["framboesa"],
  categories: ["COFFEE"],
  maxPriceCents: null,
};

function useCase(items: Product[]) {
  return new RecommendProductsFromPreferences(
    new FakeProductRepository(items),
    new DiscoveryService(),
  );
}

describe("RecommendProductsFromPreferences", () => {
  it("recomenda o café mais alinhado ao perfil", async () => {
    const result = await useCase([lightCoffee, strongCoffee, cheese]).execute({
      profile,
    });
    expect(result.fallback).toBe(false);
    expect(result.recommendations[0]?.product.id.value).toBe("coffee-light");
  });

  it("não recomenda tipos fora das coleções escolhidas", async () => {
    const result = await useCase([lightCoffee, strongCoffee, cheese]).execute({
      profile,
    });
    expect(
      result.recommendations.every((match) => match.product.type === "COFFEE"),
    ).toBe(true);
  });

  it("respeita o limite de preço", async () => {
    const result = await useCase([strongCoffee, priceyWine]).execute({
      profile: { ...profile, categories: ["COFFEE", "WINE"], maxPriceCents: 3000 },
    });
    expect(result.recommendations.map((m) => m.product.id.value)).toEqual([
      "coffee-strong",
    ]);
  });

  it("cai em fallback quando nada é elegível", async () => {
    const result = await useCase([strongCoffee, priceyWine]).execute({
      profile: {
        ...profile,
        categories: ["WINE"],
        maxPriceCents: 1000,
      },
    });
    expect(result.fallback).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.map((m) => m.product.id.value)).toContain(
      "wine-pricey",
    );
  });

  it("limita a quantidade retornada", async () => {
    const result = await useCase([lightCoffee, strongCoffee, cheese]).execute({
      profile: { ...profile, categories: [] },
      limit: 2,
    });
    expect(result.recommendations).toHaveLength(2);
  });

  it("retorna vazio quando não há produtos disponíveis", async () => {
    const result = await useCase([
      createProduct({ id: "off", type: "COFFEE", available: false }),
    ]).execute({ profile });
    expect(result.recommendations).toHaveLength(0);
    expect(result.fallback).toBe(true);
  });
});
