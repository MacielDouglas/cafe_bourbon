import { z } from "zod";
import type { Product } from "@/modules/catalog/domain/product";
import { Money } from "@/modules/catalog/domain/value-objects";
import { DomainError } from "@/modules/shared/domain/errors";

export const MAX_CART_QUANTITY = 99;
const MAX_CART_ITEMS = 50;

export const cartItemSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  quantity: z.number().int().min(1).max(MAX_CART_QUANTITY),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export interface CartLine {
  product: Product;
  quantity: number;
  subtotal: Money;
}

export interface CartSummary {
  lines: CartLine[];
  totalQuantity: number;
  total: Money;
}

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_CART_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

function merge(items: readonly CartItem[]): CartItem[] {
  const merged = new Map<string, number>();
  for (const item of items) {
    merged.set(
      item.productId,
      Math.min(MAX_CART_QUANTITY, (merged.get(item.productId) ?? 0) + item.quantity),
    );
  }
  return [...merged.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export class Cart {
  private constructor(readonly items: readonly CartItem[]) {}

  static empty(): Cart {
    return new Cart([]);
  }

  static from(items: readonly CartItem[]): Cart {
    const parsed = z.array(cartItemSchema).max(MAX_CART_ITEMS).safeParse(items);
    if (!parsed.success) {
      throw new DomainError("Itens do carrinho inválidos.");
    }
    return new Cart(merge(parsed.data));
  }

  get totalQuantity(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  add(productId: string, quantity = 1): Cart {
    return Cart.from([
      ...this.items,
      { productId, quantity: clampQuantity(quantity) },
    ]);
  }

  setQuantity(productId: string, quantity: number): Cart {
    if (quantity <= 0) return this.remove(productId);
    const next = this.items.map((item) =>
      item.productId === productId
        ? { productId, quantity: clampQuantity(quantity) }
        : item,
    );
    return Cart.from(next);
  }

  remove(productId: string): Cart {
    return Cart.from(this.items.filter((item) => item.productId !== productId));
  }

  clear(): Cart {
    return Cart.empty();
  }

  /** Preços sempre vêm dos produtos do servidor, nunca do cliente. */
  priced(products: ReadonlyMap<string, Product>): CartSummary {
    const lines: CartLine[] = [];
    let totalCents = 0;
    let totalQuantity = 0;

    for (const item of this.items) {
      const product = products.get(item.productId);
      if (!product) continue;
      const unit = product.price?.cents ?? 0;
      const subtotalCents = unit * item.quantity;
      totalCents += subtotalCents;
      totalQuantity += item.quantity;
      lines.push({
        product,
        quantity: item.quantity,
        subtotal: Money.cents(subtotalCents),
      });
    }

    return { lines, totalQuantity, total: Money.cents(totalCents) };
  }
}
