export {
  type ProductType,
  type Scale,
  type BrewMethod,
  Money,
  ProductId,
  normalizeNotes,
} from "@/modules/catalog/domain/value-objects";
export {
  type CoffeeProfile,
  type CheeseProfile,
  type WineProfile,
  type ProductProfile,
  type ProductInput,
} from "@/modules/catalog/domain/schemas";
export { type SensoryAxes, Product } from "@/modules/catalog/domain/product";
export {
  type ProductFilter,
  type ProductRepository,
  type PaginatedProducts,
  clampPage,
  clampPageSize,
} from "@/modules/catalog/domain/repository";
export { DomainError } from "@/modules/shared/domain/errors";
