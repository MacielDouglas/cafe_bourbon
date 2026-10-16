import { describe, expect, it } from "vitest";
import { ListProducts } from "@/modules/catalog/application/list-products";
import {
  type PaginatedProducts,
  type ProductFilter,
  type ProductRepository,
} from "@/modules/catalog/domain/repository";
import type { Product } from "@/modules/catalog/domain/product";
import { createProduct } from "@/testing/product-factory";

class FakeProductRepository implements ProductRepository {
  lastFilter: ProductFilter | null = null;

  constructor(private readonly items: Product[] = []) {}

  async list(filter: ProductFilter): Promise<PaginatedProducts> {
    this.lastFilter = filter;
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 12;
    const filtered = this.items.filter(
      (item) => !filter.type || item.type === filter.type,
    );
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

describe("ListProducts", () => {
  it("paginação fora da faixa é normalizada", async () => {
    const repo = new FakeProductRepository([createProduct()]);
    const useCase = new ListProducts(repo);
    await useCase.execute({ page: 0, pageSize: 999 });
    expect(repo.lastFilter?.page).toBe(1);
    expect(repo.lastFilter?.pageSize).toBe(50);
  });

  it("filtros são repassados ao repositório", async () => {
    const repo = new FakeProductRepository([
      createProduct({ type: "COFFEE" }),
      createProduct({ type: "CHEESE" }),
      createProduct({ type: "WINE" }),
    ]);
    const useCase = new ListProducts(repo);
    const result = await useCase.execute({ type: "CHEESE" });
    expect(result.total).toBe(1);
    expect(result.items[0]?.type).toBe("CHEESE");
  });

  it("retorna lista vazia sem produtos", async () => {
    const useCase = new ListProducts(new FakeProductRepository());
    const result = await useCase.execute();
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
