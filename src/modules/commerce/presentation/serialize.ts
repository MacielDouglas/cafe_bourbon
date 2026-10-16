import type { ProductType } from "@/modules/catalog/domain/value-objects";
import { formatCents } from "@/modules/catalog/presentation/format";
import type { CartSummary } from "@/modules/commerce/domain/cart";

export interface SerializedCartLine {
  productId: string;
  slug: string;
  name: string;
  type: ProductType;
  imageUrl: string | null;
  isDemoData: boolean;
  quantity: number;
  priceCents: number;
  priceLabel: string;
  subtotalCents: number;
  subtotalLabel: string;
}

export interface SerializedCart {
  lines: SerializedCartLine[];
  totalQuantity: number;
  totalCents: number;
  totalLabel: string;
}

/** Converte o agregado de domínio para um payload seguro (preços do servidor). */
export function serializeCart(summary: CartSummary): SerializedCart {
  return {
    lines: summary.lines.map((line) => ({
      productId: line.product.id.value,
      slug: line.product.slug,
      name: line.product.name,
      type: line.product.type,
      imageUrl: line.product.imageUrl,
      isDemoData: line.product.isDemoData,
      quantity: line.quantity,
      priceCents: line.product.price?.cents ?? 0,
      priceLabel: formatCents(line.product.price?.cents ?? 0),
      subtotalCents: line.subtotal.cents,
      subtotalLabel: formatCents(line.subtotal.cents),
    })),
    totalQuantity: summary.totalQuantity,
    totalCents: summary.total.cents,
    totalLabel: formatCents(summary.total.cents),
  };
}
