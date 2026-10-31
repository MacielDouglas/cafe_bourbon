import type { ProductRepository } from "@/modules/catalog/domain/repository";
import type { CartRepository, CartIdentity } from "@/modules/commerce/domain/cart-repository";
import type {
  OrderLine,
  OrderSummary,
} from "@/modules/commerce/domain/order";
import type { OrderRepository } from "@/modules/commerce/domain/order-repository";
import { computeHarmonizationDiscount } from "@/modules/shared/domain/harmonization-kit";
import { DomainError } from "@/modules/shared/domain/errors";

export interface CheckoutCustomer {
  name: string;
  email: string;
}

/**
 * Checkout: valida o carrinho contra o catálogo do servidor e
 * delega a baixa de estoque + criação do pedido ao repositório (transação).
 */
export class CreateOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
    private readonly carts: CartRepository,
  ) {}

  async execute(
    identity: CartIdentity,
    customer: CheckoutCustomer,
  ): Promise<OrderSummary> {
    if (!identity.userId) {
      throw new DomainError("Entre na sua conta para finalizar o pedido.");
    }

    const items = await this.carts.list(identity);
    if (items.length === 0) {
      throw new DomainError("Seu carrinho está vazio.");
    }

    const products = await this.products.findByIds(
      items.map((item) => item.productId),
    );
    const byId = new Map(products.map((product) => [product.id.value, product]));

    for (const item of items) {
      const product = byId.get(item.productId);
      if (!product) {
        throw new DomainError("Um dos produtos do carrinho não existe mais.");
      }
      if (!product.purchasable) {
        throw new DomainError(`Produto indisponível: ${product.name}.`);
      }
      if (product.stock < item.quantity) {
        throw new DomainError(
          `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}.`,
        );
      }
    }

    const discount = computeHarmonizationDiscount(
      items.flatMap((item) => {
        const product = byId.get(item.productId);
        if (!product) return [];
        return [
          {
            productId: product.id.value,
            type: product.type,
            priceCents: product.price?.cents ?? 0,
            quantity: item.quantity,
          },
        ];
      }),
    );

    const lines: OrderLine[] = [];
    let totalCents = 0;

    for (const item of items) {
      const product = byId.get(item.productId);
      if (!product) continue;
      const unitPriceCents = product.price?.cents ?? 0;
      const grossSubtotalCents = unitPriceCents * item.quantity;
      const lineDiscountCents = Math.min(
        grossSubtotalCents,
        discount.discountByProductId.get(product.id.value) ?? 0,
      );
      const subtotalCents = grossSubtotalCents - lineDiscountCents;
      totalCents += subtotalCents;
      lines.push({
        productId: product.id.value,
        productName: product.name,
        unitPriceCents,
        quantity: item.quantity,
        subtotalCents,
      });
    }

    return this.orders.create({
      userId: identity.userId,
      customerName: customer.name,
      customerEmail: customer.email,
      totalCents,
      items: lines,
    });
  }
}
