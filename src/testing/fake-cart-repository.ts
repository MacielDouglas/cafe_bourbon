import { clampQuantity, type CartItem } from "@/modules/commerce/domain/cart";
import type {
  CartIdentity,
  CartRepository,
} from "@/modules/commerce/domain/cart-repository";

export class FakeCartRepository implements CartRepository {
  private readonly rows = new Map<string, CartItem>();

  private key(identity: CartIdentity, productId: string): string {
    const owner = identity.userId ?? identity.sessionKey ?? "anon";
    return `${owner}::${productId}`;
  }

  async list(identity: CartIdentity): Promise<CartItem[]> {
    const owner = identity.userId ?? identity.sessionKey;
    if (!owner) return [];
    return [...this.rows.entries()]
      .filter(([key]) => key.startsWith(`${owner}::`))
      .map(([, item]) => ({ ...item }));
  }

  async add(
    identity: CartIdentity,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const key = this.key(identity, productId);
    const current = this.rows.get(key)?.quantity ?? 0;
    this.rows.set(key, {
      productId,
      quantity: clampQuantity(current + quantity),
    });
  }

  async setQuantity(
    identity: CartIdentity,
    productId: string,
    quantity: number,
  ): Promise<void> {
    await this.remove(identity, productId);
    if (quantity > 0) {
      this.rows.set(this.key(identity, productId), {
        productId,
        quantity: clampQuantity(quantity),
      });
    }
  }

  async remove(identity: CartIdentity, productId: string): Promise<void> {
    this.rows.delete(this.key(identity, productId));
  }

  async clear(identity: CartIdentity): Promise<void> {
    const owner = identity.userId ?? identity.sessionKey;
    if (!owner) return;
    for (const key of [...this.rows.keys()]) {
      if (key.startsWith(`${owner}::`)) this.rows.delete(key);
    }
  }
}
