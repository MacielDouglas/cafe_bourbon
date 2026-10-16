import type { BrewMethod } from "@/modules/catalog/domain/value-objects";
import type {
  GrindOption,
  SubscriptionPlan,
} from "@/modules/commerce/domain/subscription";

export interface NewSubscription {
  userId: string;
  plan: SubscriptionPlan;
  grind: GrindOption;
  brewMethod: BrewMethod | null;
  coffeeId: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string | null;
  plan: SubscriptionPlan;
  grind: GrindOption;
  brewMethod: BrewMethod | null;
  coffeeId: string;
  status: string;
  createdAt: Date;
}

export interface SubscriptionRepository {
  create(input: NewSubscription): Promise<SubscriptionRecord>;
}
