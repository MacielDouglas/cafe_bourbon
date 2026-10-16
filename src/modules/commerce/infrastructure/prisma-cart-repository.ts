import type { PrismaClient } from "@prisma/client";
import { clampQuantity, type CartItem } from "@/modules/commerce/domain/cart";
import type {
  CartIdentity,
  CartRepository,
} from "@/modules/commerce/domain/cart-repository";
import { DomainError } from "@/modules/shared/domain/errors";

type OwnerFilter =
  | { userId: string; sessionKey: null }
  | { userId: null; sessionKey: string };

export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(identity: CartIdentity): Promise<CartItem[]> {
    const owner = this.ownerOrNull(identity);
    if (!owner) return [];
    const rows = await this.prisma.cartItem.findMany({
      where: owner,
      orderBy: { createdAt: "asc" },
    });
    return rows.map((row) => ({
      productId: row.productId,
      quantity: clampQuantity(row.quantity),
    }));
  }

  async add(
    identity: CartIdentity,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const owner = this.requireOwner(identity);
    const existing = await this.prisma.cartItem.findFirst({
      where: { ...owner, productId },
    });
    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: clampQuantity(existing.quantity + quantity) },
      });
      return;
    }
    await this.prisma.cartItem.create({
      data: { ...owner, productId, quantity: clampQuantity(quantity) },
    });
  }

  async setQuantity(
    identity: CartIdentity,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const owner = this.requireOwner(identity);
    if (quantity <= 0) {
      await this.remove(identity, productId);
      return;
    }
    await this.prisma.cartItem.updateMany({
      where: { ...owner, productId },
      data: { quantity: clampQuantity(quantity) },
    });
  }

  async remove(identity: CartIdentity, productId: string): Promise<void> {
    const owner = this.requireOwner(identity);
    await this.prisma.cartItem.deleteMany({ where: { ...owner, productId } });
  }

  async clear(identity: CartIdentity): Promise<void> {
    const owner = this.requireOwner(identity);
    await this.prisma.cartItem.deleteMany({ where: owner });
  }

  private ownerOrNull(identity: CartIdentity): OwnerFilter | null {
    if (identity.userId) return { userId: identity.userId, sessionKey: null };
    if (identity.sessionKey) {
      return { userId: null, sessionKey: identity.sessionKey };
    }
    return null;
  }

  private requireOwner(identity: CartIdentity): OwnerFilter {
    const owner = this.ownerOrNull(identity);
    if (!owner) {
      throw new DomainError("Identidade de carrinho ausente.");
    }
    return owner;
  }
}
