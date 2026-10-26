import { connection } from "next/server";
import type { Product } from "@/modules/catalog/domain/product";
import type { ProductInput } from "@/modules/catalog/domain/schemas";
import { catalogAdminUseCases } from "@/modules/catalog/presentation/composition";
import { commerceUseCases } from "@/modules/commerce/presentation/composition";
import type {
  OrderSummary,
  SalesOverview,
} from "@/modules/commerce/domain/order";

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: ProductInput["type"];
  priceCents: number | null;
  stock: number;
  available: boolean;
  isDemoData: boolean;
  imageUrl: string | null;
  profile: ProductInput["profile"];
}

export function serializeAdminProduct(product: Product): AdminProduct {
  return {
    id: product.id.value,
    name: product.name,
    slug: product.slug,
    description: product.description,
    type: product.type,
    priceCents: product.price?.cents ?? null,
    stock: product.stock,
    available: product.available,
    isDemoData: product.isDemoData,
    imageUrl: product.imageUrl,
    profile: product.profile,
  };
}

export interface AdminProductsResult {
  products: AdminProduct[];
  failed: boolean;
}

export async function loadAdminProducts(): Promise<AdminProductsResult> {
  await connection();
  try {
    const { manageProducts } = catalogAdminUseCases();
    return {
      products: (await manageProducts.list()).map(serializeAdminProduct),
      failed: false,
    };
  } catch {
    return { products: [], failed: true };
  }
}

export interface AdminProductResult {
  product: AdminProduct | null;
  failed: boolean;
}

export async function loadAdminProduct(id: string): Promise<AdminProductResult> {
  await connection();
  try {
    const { manageProducts } = catalogAdminUseCases();
    const product = await manageProducts.findById(id);
    return {
      product: product ? serializeAdminProduct(product) : null,
      failed: false,
    };
  } catch {
    return { product: null, failed: true };
  }
}

export interface SalesOverviewResult {
  overview: SalesOverview | null;
  failed: boolean;
}

export async function loadSalesOverview(): Promise<SalesOverviewResult> {
  await connection();
  try {
    const { getSalesOverview } = commerceUseCases();
    return { overview: await getSalesOverview.execute(), failed: false };
  } catch {
    return { overview: null, failed: true };
  }
}

export interface OrdersResult {
  orders: OrderSummary[];
  failed: boolean;
}

export async function loadOrders(): Promise<OrdersResult> {
  await connection();
  try {
    const { listOrders } = commerceUseCases();
    return { orders: await listOrders.execute(), failed: false };
  } catch {
    return { orders: [], failed: true };
  }
}
