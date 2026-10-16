import type { ProductRepository } from "@/modules/catalog/domain/repository";
import {
  type CreateSubscriptionInput,
  type SubscriptionPlanDetails,
  planDetails,
} from "@/modules/commerce/domain/subscription";
import type {
  SubscriptionRecord,
  SubscriptionRepository,
} from "@/modules/commerce/domain/subscription-repository";
import { DomainError } from "@/modules/shared/domain/errors";

export interface CreatedSubscription {
  record: SubscriptionRecord;
  plan: SubscriptionPlanDetails;
}

export class CreateSubscription {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly products: ProductRepository,
  ) {}

  async execute(
    userId: string,
    input: CreateSubscriptionInput,
  ): Promise<CreatedSubscription> {
    const [coffee] = await this.products.findByIds([input.coffeeId]);
    if (!coffee || coffee.type !== "COFFEE") {
      throw new DomainError("Escolha um café válido para a assinatura.");
    }
    if (!coffee.available) {
      throw new DomainError("Este café está indisponível no momento.");
    }

    const record = await this.subscriptions.create({
      userId,
      plan: input.plan,
      grind: input.grind,
      brewMethod: input.brewMethod,
      coffeeId: coffee.id.value,
    });

    return { record, plan: planDetails(input.plan) };
  }
}
