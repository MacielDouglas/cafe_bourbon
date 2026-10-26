import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  type AdminProductRepository,
  type MediaRepository,
  type ProductMediaInput,
} from "@/modules/catalog/domain/admin-repository";
import { Product } from "@/modules/catalog/domain/product";
import { productInputSchema } from "@/modules/catalog/domain/schemas";
import { DomainError } from "@/modules/shared/domain/errors";

export const productWriteSchema = productInputSchema.omit({
  id: true,
  imageUrl: true,
  isDemoData: true,
});

export type ProductWriteInput = z.infer<typeof productWriteSchema>;

export const stockSchema = z.number().int().min(0).max(1_000_000);

function parseWriteInput(input: unknown): ProductWriteInput {
  const parsed = productWriteSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError(`Produto inválido: ${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

/** CRUD administrativo do catálogo. Regras de negócio ficam aqui, não na UI. */
export class ManageProducts {
  constructor(private readonly products: AdminProductRepository) {}

  async findById(id: string): Promise<Product | null> {
    return this.products.findById(id);
  }

  async list(): Promise<Product[]> {
    return this.products.listAll();
  }

  async create(input: unknown): Promise<Product> {
    const data = parseWriteInput(input);
    const product = Product.create({
      ...data,
      id: randomUUID(),
      imageUrl: null,
      isDemoData: false,
    });
    try {
      await this.products.create(product);
    } catch (error) {
      throw this.mapWriteError(error);
    }
    return product;
  }

  async update(id: string, input: unknown): Promise<Product> {
    const current = await this.products.findById(id);
    if (!current) throw new DomainError("Produto não encontrado.");

    const data = parseWriteInput(input);
    const product = Product.create({
      ...data,
      id,
      imageUrl: current.imageUrl,
      isDemoData: current.isDemoData,
    });
    try {
      await this.products.update(product);
    } catch (error) {
      throw this.mapWriteError(error);
    }
    return product;
  }

  async setAvailability(id: string, available: boolean): Promise<void> {
    const current = await this.products.findById(id);
    if (!current) throw new DomainError("Produto não encontrado.");
    await this.products.setAvailability(id, available);
  }

  async setStock(id: string, stock: number): Promise<void> {
    const parsed = stockSchema.safeParse(stock);
    if (!parsed.success) {
      throw new DomainError("Quantidade em estoque inválida.");
    }
    const current = await this.products.findById(id);
    if (!current) throw new DomainError("Produto não encontrado.");
    await this.products.setStock(id, parsed.data);
  }

  async delete(id: string): Promise<void> {
    const current = await this.products.findById(id);
    if (!current) throw new DomainError("Produto não encontrado.");
    await this.products.delete(id);
  }

  private mapWriteError(error: unknown): DomainError {
    if (error instanceof DomainError) return error;
    const code = (error as { code?: unknown }).code;
    if (code === "P2002") {
      return new DomainError("Já existe um produto com este slug.");
    }
    return new DomainError("Não foi possível salvar o produto.");
  }
}

export class SetProductImage {
  constructor(
    private readonly products: AdminProductRepository,
    private readonly media: MediaRepository,
  ) {}

  async execute(productId: string, image: ProductMediaInput) {
    const product = await this.products.findById(productId);
    if (!product) throw new DomainError("Produto não encontrado.");
    return this.media.replaceForProduct(productId, image);
  }
}

export class RemoveProductImage {
  constructor(private readonly media: MediaRepository) {}

  async execute(productId: string): Promise<void> {
    await this.media.removeForProduct(productId);
  }
}

export class GetMedia {
  constructor(private readonly media: MediaRepository) {}

  async execute(id: string) {
    return this.media.findById(id);
  }
}
