import type { Product } from "@/modules/catalog/domain/product";
import type { ProductRepository } from "@/modules/catalog/domain/repository";

export class GetProductDetails {
  constructor(private readonly products: ProductRepository) {}

  async execute(slug: string): Promise<Product | null> {
    const normalized = slug.trim().toLowerCase();
    if (!normalized) return null;
    return this.products.findBySlug(normalized);
  }
}
