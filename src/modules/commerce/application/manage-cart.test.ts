import { describe, expect, it } from "vitest";
import { GetCart } from "@/modules/commerce/application/get-cart";
import { ManageCart } from "@/modules/commerce/application/manage-cart";
import type { CartIdentity } from "@/modules/commerce/domain/cart-repository";
import { DomainError } from "@/modules/shared/domain/errors";
import { FakeCartRepository } from "@/testing/fake-cart-repository";
import { FakeProductRepository } from "@/testing/fake-product-repository";
import { createProduct } from "@/testing/product-factory";

const identity: CartIdentity = { userId: null, sessionKey: "sessao-1" };

const coffee = createProduct({
  id: "coffee-1",
  type: "COFFEE",
  slug: "coffee-1",
  priceCents: 2000,
});

const cheese = createProduct({
  id: "cheese-1",
  type: "CHEESE",
  slug: "cheese-1",
  priceCents: 3500,
});

const unavailable = createProduct({
  id: "wine-off",
  type: "WINE",
  slug: "wine-off",
  available: false,
});

function setup() {
  const carts = new FakeCartRepository();
  const products = new FakeProductRepository([coffee, cheese, unavailable]);
  return {
    carts,
    products,
    manage: new ManageCart(carts, products),
    getCart: new GetCart(carts, products),
  };
}

describe("ManageCart + GetCart", () => {
  it("adiciona itens e calcula o total com preços do servidor", async () => {
    const { manage, getCart } = setup();
    await manage.add(identity, "coffee-1");
    await manage.add(identity, "coffee-1");
    await manage.add(identity, "cheese-1", 2);

    const summary = await getCart.execute(identity);
    expect(summary.totalQuantity).toBe(4);
    expect(summary.total.cents).toBe(2000 * 2 + 3500 * 2);
    const coffeeLine = summary.lines.find(
      (line) => line.product.id.value === "coffee-1",
    );
    expect(coffeeLine?.quantity).toBe(2);
    expect(coffeeLine?.subtotal.cents).toBe(4000);
  });

  it("recusa produto indisponível", async () => {
    const { manage } = setup();
    await expect(manage.add(identity, "wine-off")).rejects.toBeInstanceOf(
      DomainError,
    );
  });

  it("recusa produto inexistente", async () => {
    const { manage } = setup();
    await expect(manage.add(identity, "nao-existe")).rejects.toBeInstanceOf(
      DomainError,
    );
  });

  it("limita a quantidade máxima por item", async () => {
    const { manage, getCart } = setup();
    await manage.add(identity, "coffee-1", 500);
    const summary = await getCart.execute(identity);
    expect(summary.lines[0]?.quantity).toBe(99);
  });

  it("remove o item ao definir quantidade zero", async () => {
    const { manage, getCart } = setup();
    await manage.add(identity, "coffee-1", 3);
    await manage.setQuantity(identity, "coffee-1", 0);
    const summary = await getCart.execute(identity);
    expect(summary.lines).toHaveLength(0);
  });

  it("isola carrinhos por identidade", async () => {
    const { manage, getCart } = setup();
    await manage.add(identity, "coffee-1");
    await manage.add({ userId: "u-2", sessionKey: null }, "cheese-1");

    const anon = await getCart.execute(identity);
    const user = await getCart.execute({ userId: "u-2", sessionKey: null });
    expect(anon.lines.map((line) => line.product.id.value)).toEqual([
      "coffee-1",
    ]);
    expect(user.lines.map((line) => line.product.id.value)).toEqual([
      "cheese-1",
    ]);
  });

  it("retorna vazio sem identidade", async () => {
    const { getCart } = setup();
    const summary = await getCart.execute({ userId: null, sessionKey: null });
    expect(summary.lines).toHaveLength(0);
    expect(summary.total.cents).toBe(0);
  });
});
