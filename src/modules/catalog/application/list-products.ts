import {
  clampPage,
  clampPageSize,
  type PaginatedProducts,
  type ProductFilter,
  type ProductRepository,
} from "@/modules/catalog/domain/repository";
import type { ProductType } from "@/modules/catalog/domain/value-objects";

export interface ListProductsInput {
  type?: ProductType;
  availableOnly?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export class ListProducts {
  constructor(private readonly products: ProductRepository) {}

  async execute(input: ListProductsInput = {}): Promise<PaginatedProducts> {
    const filter: ProductFilter = {
      ...(input.type ? { type: input.type } : {}),
      ...(input.availableOnly ? { availableOnly: true } : {}),
      ...(input.search?.trim() ? { search: input.search.trim() } : {}),
      page: clampPage(input.page),
      pageSize: clampPageSize(input.pageSize),
    };
    return this.products.list(filter);
  }
}
