import type { Product } from "@/modules/catalog/domain/product";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}

export function formatProductPrice(product: Product): string | null {
  return product.price ? formatCents(product.price.cents) : null;
}
