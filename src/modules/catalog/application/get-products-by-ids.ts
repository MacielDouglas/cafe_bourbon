import type { Product } from "@/modules/catalog/domain/product";
import type { ProductRepository } from "@/modules/catalog/domain/repository";

export class GetProductsByIds {
  constructor(private readonly products: ProductRepository) {}

  async execute(ids: readonly string[]): Promise<Product[]> {
    const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
    if (unique.length === 0) return [];
    return this.products.findByIds(unique);
  }
}
