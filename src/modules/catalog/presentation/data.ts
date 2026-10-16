import { connection } from "next/server";
import type { Product } from "@/modules/catalog/domain/product";
import type { ProductType } from "@/modules/catalog/domain/value-objects";
import { catalogUseCases } from "@/modules/catalog/presentation/composition";

export interface CatalogListResult {
  products: Product[];
  total: number;
  failed: boolean;
}

export interface CatalogListInput {
  type?: ProductType;
  search?: string;
  page?: number;
  pageSize?: number;
}

function describe(error: unknown): string {
  if (!(error instanceof Error)) return "erro desconhecido";
  const code = (error as { code?: unknown }).code;
  return typeof code === "string"
    ? `${error.name} (${code}): ${error.message}`
    : `${error.name}: ${error.message}`;
}

/** Lista produtos tratando indisponibilidade do banco sem quebrar a página. */
export async function loadProducts(
  input: CatalogListInput = {},
): Promise<CatalogListResult> {
  await connection();
  try {
    const { listProducts } = catalogUseCases();
    const page = await listProducts.execute(input);
    return { products: page.items, total: page.total, failed: false };
  } catch (error) {
    console.error("[catalog] falha ao listar produtos:", describe(error));
    return { products: [], total: 0, failed: true };
  }
}

export interface CatalogProductResult {
  product: Product | null;
  failed: boolean;
}

/** Busca um produto por slug tratando indisponibilidade do banco. */
export async function loadProduct(slug: string): Promise<CatalogProductResult> {
  await connection();
  try {
    const { getProductDetails } = catalogUseCases();
    return { product: await getProductDetails.execute(slug), failed: false };
  } catch (error) {
    console.error("[catalog] falha ao carregar produto:", describe(error));
    return { product: null, failed: true };
  }
}
