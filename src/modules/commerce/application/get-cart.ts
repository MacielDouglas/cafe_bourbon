import type { ProductRepository } from "@/modules/catalog/domain/repository";
import { Cart, type CartSummary } from "@/modules/commerce/domain/cart";
import type {
  CartIdentity,
  CartRepository,
} from "@/modules/commerce/domain/cart-repository";

export class GetCart {
  constructor(
    private readonly carts: CartRepository,
    private readonly products: ProductRepository,
  ) {}

  async execute(identity: CartIdentity): Promise<CartSummary> {
    const items = await this.carts.list(identity);
    const cart = Cart.from(items);
    if (cart.items.length === 0) {
      return cart.priced(new Map());
    }
    const ids = cart.items.map((item) => item.productId);
    const products = await this.products.findByIds(ids);
    const byId = new Map(products.map((product) => [product.id.value, product]));
    return cart.priced(byId);
  }
}
