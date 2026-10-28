import type { Product } from "@/modules/catalog/domain/product";
import type { ProductType } from "@/modules/catalog/domain/value-objects";

export type ProductSort =
  | "name"
  | "price-asc"
  | "price-desc"
  | "intensity-desc";

export interface ProductFilter {
  type?: ProductType;
  availableOnly?: boolean;
  search?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export function clampPage(page: number | undefined): number {
  if (!page || !Number.isFinite(page)) return 1;
  return Math.min(Math.max(Math.trunc(page), 1), 10_000);
}

export function clampPageSize(pageSize: number | undefined): number {
  if (!pageSize || !Number.isFinite(pageSize)) return 12;
  return Math.min(Math.max(Math.trunc(pageSize), 1), 50);
}

export interface ProductRepository {
  list(filter: ProductFilter): Promise<PaginatedProducts>;
  findBySlug(slug: string): Promise<Product | null>;
  findByIds(ids: readonly string[]): Promise<Product[]>;
}
