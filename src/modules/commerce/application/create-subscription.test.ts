import { describe, expect, it } from "vitest";
import { CreateSubscription } from "@/modules/commerce/application/create-subscription";
import type {
  NewSubscription,
  SubscriptionRecord,
  SubscriptionRepository,
} from "@/modules/commerce/domain/subscription-repository";
import { DomainError } from "@/modules/shared/domain/errors";
import { FakeProductRepository } from "@/testing/fake-product-repository";
import { createProduct } from "@/testing/product-factory";

class FakeSubscriptionRepository implements SubscriptionRepository {
  readonly created: NewSubscription[] = [];

  async create(input: NewSubscription): Promise<SubscriptionRecord> {
    this.created.push(input);
    return {
      id: `sub-${this.created.length}`,
      userId: input.userId,
      plan: input.plan,
      grind: input.grind,
      brewMethod: input.brewMethod,
      coffeeId: input.coffeeId,
      status: "ACTIVE",
      createdAt: new Date(0),
    };
  }
}

const coffee = createProduct({ id: "coffee-1", type: "COFFEE", slug: "coffee-1" });
const cheese = createProduct({ id: "cheese-1", type: "CHEESE", slug: "cheese-1" });
const offCoffee = createProduct({
  id: "coffee-off",
  type: "COFFEE",
  slug: "coffee-off",
  available: false,
});

function setup() {
  const subscriptions = new FakeSubscriptionRepository();
  const products = new FakeProductRepository([coffee, cheese, offCoffee]);
  return { subscriptions, useCase: new CreateSubscription(subscriptions, products) };
}

describe("CreateSubscription", () => {
  it("cria a assinatura com plano e café válidos", async () => {
    const { useCase, subscriptions } = setup();
    const result = await useCase.execute("user-1", {
      plan: "COFFEE_LOVERS",
      grind: "MOIDO",
      brewMethod: "COADO",
      coffeeId: "coffee-1",
    });

    expect(result.record.id).toBe("sub-1");
    expect(result.plan.priceCents).toBe(12000);
    expect(subscriptions.created[0]).toMatchObject({
      userId: "user-1",
      plan: "COFFEE_LOVERS",
      grind: "MOIDO",
      coffeeId: "coffee-1",
    });
  });

  it("recusa item que não é café", async () => {
    const { useCase } = setup();
    await expect(
      useCase.execute("user-1", {
        plan: "MENSAL",
        grind: "GRAOS",
        brewMethod: null,
        coffeeId: "cheese-1",
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("recusa café indisponível", async () => {
    const { useCase } = setup();
    await expect(
      useCase.execute("user-1", {
        plan: "MENSAL",
        grind: "GRAOS",
        brewMethod: null,
        coffeeId: "coffee-off",
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("recusa café inexistente", async () => {
    const { useCase } = setup();
    await expect(
      useCase.execute("user-1", {
        plan: "TRIMESTRAL",
        grind: "GRAOS",
        brewMethod: null,
        coffeeId: "nao-existe",
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
