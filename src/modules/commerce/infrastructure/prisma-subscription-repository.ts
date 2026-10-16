import type { PrismaClient } from "@prisma/client";
import { brewMethodSchema } from "@/modules/catalog/domain/value-objects";
import type {
  NewSubscription,
  SubscriptionRecord,
  SubscriptionRepository,
} from "@/modules/commerce/domain/subscription-repository";

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: NewSubscription): Promise<SubscriptionRecord> {
    const record = await this.prisma.subscription.create({
      data: {
        userId: input.userId,
        plan: input.plan,
        grind: input.grind,
        brewMethod: input.brewMethod,
        coffeeId: input.coffeeId,
      },
    });

    const brewMethod = brewMethodSchema.safeParse(record.brewMethod);

    return {
      id: record.id,
      userId: record.userId,
      plan: record.plan,
      grind: record.grind,
      brewMethod: brewMethod.success ? brewMethod.data : null,
      coffeeId: record.coffeeId,
      status: record.status,
      createdAt: record.createdAt,
    };
  }
}
