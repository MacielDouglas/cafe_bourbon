import type { Product } from "@/modules/catalog/domain/product";
import type { ProductRepository } from "@/modules/catalog/domain/repository";
import { clampQuantity } from "@/modules/commerce/domain/cart";
import type {
  CartIdentity,
  CartRepository,
} from "@/modules/commerce/domain/cart-repository";
import {
  HARMONIZATION_KIT_MAX_PRODUCTS,
  HARMONIZATION_KIT_MIN_PRODUCTS,
  assertHarmonizationKit,
} from "@/modules/shared/domain/harmonization-kit";
import { DomainError } from "@/modules/shared/domain/errors";

/**
 * Mantém o carrinho. Toda validação de disponibilidade e preço é
 * feita aqui, a partir do catálogo do servidor — o cliente nunca define preço.
 */
export class ManageCart {
  constructor(
    private readonly carts: CartRepository,
    private readonly products: ProductRepository,
  ) {}

  async add(
    identity: CartIdentity,
    productId: string,
    quantity = 1,
  ): Promise<void> {
    const product = await this.findPurchasable(productId);
    const amount = clampQuantity(quantity);
    this.ensureStock(product, amount);
    await this.carts.add(identity, product.id.value, amount);
  }

  async addKit(identity: CartIdentity, productIds: string[]): Promise<void> {
    const unique = [...new Set(productIds)];
    if (
      unique.length < HARMONIZATION_KIT_MIN_PRODUCTS ||
      unique.length > HARMONIZATION_KIT_MAX_PRODUCTS
    ) {
      throw new DomainError(
        `Kit de harmonização deve ter ${HARMONIZATION_KIT_MIN_PRODUCTS} ou ${HARMONIZATION_KIT_MAX_PRODUCTS} produtos.`,
      );
    }

    const products = await this.products.findByIds(unique);
    if (products.length !== unique.length) {
      throw new DomainError("Um dos produtos do kit não existe mais.");
    }
    assertHarmonizationKit(products);

    for (const product of products) {
      if (!product.purchasable) {
        throw new DomainError(`Produto indisponível: ${product.name}.`);
      }
      if (product.stock < 1) {
        throw new DomainError(
          `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}.`,
        );
      }
    }

    for (const product of products) {
      await this.carts.add(identity, product.id.value, 1);
    }
  }

  async setQuantity(
    identity: CartIdentity,
    productId: string,
    quantity: number,
  ): Promise<void> {
    if (quantity <= 0) {
      await this.carts.remove(identity, productId);
      return;
    }
    const product = await this.findPurchasable(productId);
    const amount = clampQuantity(quantity);
    this.ensureStock(product, amount);
    await this.carts.setQuantity(identity, product.id.value, amount);
  }

  async remove(identity: CartIdentity, productId: string): Promise<void> {
    await this.carts.remove(identity, productId);
  }

  async clear(identity: CartIdentity): Promise<void> {
    await this.carts.clear(identity);
  }

  private async findPurchasable(productId: string): Promise<Product> {
    const [product] = await this.products.findByIds([productId]);
    if (!product) {
      throw new DomainError("Produto não encontrado.");
    }
    if (!product.purchasable) {
      throw new DomainError("Produto indisponível para compra.");
    }
    return product;
  }

  private ensureStock(product: Product, quantity: number): void {
    if (product.stock < quantity) {
      throw new DomainError(
        `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}.`,
      );
    }
  }
}
