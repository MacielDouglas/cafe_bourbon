import type { Product } from "@/modules/catalog/domain/product";

export interface ProductMediaInput {
  mimeType: string;
  base64: string;
  byteSize: number;
  width: number | null;
  height: number | null;
}

export interface MediaRecord extends ProductMediaInput {
  id: string;
  createdAt: Date;
}

/** Escritas administrativas do catálogo (fora do fluxo público de leitura). */
export interface AdminProductRepository {
  findById(id: string): Promise<Product | null>;
  listAll(): Promise<Product[]>;
  create(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
  setAvailability(id: string, available: boolean): Promise<void>;
  setStock(id: string, stock: number): Promise<void>;
}

export interface MediaRepository {
  findById(id: string): Promise<MediaRecord | null>;
  replaceForProduct(productId: string, media: ProductMediaInput): Promise<MediaRecord>;
  removeForProduct(productId: string): Promise<void>;
}
