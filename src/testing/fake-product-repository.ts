import type { Product } from "@/modules/catalog/domain/product";
import type {
  PaginatedProducts,
  ProductFilter,
  ProductRepository,
} from "@/modules/catalog/domain/repository";

export class FakeProductRepository implements ProductRepository {
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
