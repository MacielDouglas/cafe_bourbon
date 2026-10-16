import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanDetails,
} from "@/modules/commerce/domain/subscription";

export class ListSubscriptionPlans {
  execute(): readonly SubscriptionPlanDetails[] {
    return SUBSCRIPTION_PLANS;
  }
}
