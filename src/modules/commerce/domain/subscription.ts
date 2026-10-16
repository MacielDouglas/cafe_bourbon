import { z } from "zod";
import { brewMethodSchema } from "@/modules/catalog/domain/value-objects";

export const subscriptionPlanSchema = z.enum([
  "MENSAL",
  "COFFEE_LOVERS",
  "TRIMESTRAL",
]);

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;

export const grindOptionSchema = z.enum(["GRAOS", "MOIDO"]);

export type GrindOption = z.infer<typeof grindOptionSchema>;

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  priceCents: number;
  cadence: string;
  description: string;
  perks: string[];
}

export const SUBSCRIPTION_PLANS: readonly SubscriptionPlanDetails[] = [
  {
    id: "MENSAL",
    name: "Mensal",
    priceCents: 9000,
    cadence: "por mês",
    description: "Um café de origem única por mês, do jeito que você preferir.",
    perks: ["1 pacote de 250g", "Escolha da moagem", "Frete incluído"],
  },
  {
    id: "COFFEE_LOVERS",
    name: "Coffee Lovers",
    priceCents: 12000,
    cadence: "por mês",
    description: "Dois cafés por mês, com seleção rotativa e mimos da casa.",
    perks: ["2 pacotes de 250g", "Seleção rotativa", "Brinde surpresa"],
  },
  {
    id: "TRIMESTRAL",
    name: "Trimestral",
    priceCents: 27000,
    cadence: "por trimestre",
    description: "Um trimestre de café com desconto e prioridade nos lotes raros.",
    perks: ["3 pacotes por entrega", "Prioridade em lotes raros", "Economia de 10%"],
  },
];

export function planDetails(plan: SubscriptionPlan): SubscriptionPlanDetails {
  const found = SUBSCRIPTION_PLANS.find((item) => item.id === plan);
  if (!found) {
    throw new Error(`Plano de assinatura desconhecido: ${plan}`);
  }
  return found;
}

export const createSubscriptionInputSchema = z.object({
  plan: subscriptionPlanSchema,
  grind: grindOptionSchema,
  brewMethod: brewMethodSchema.nullable().default(null),
  coffeeId: z.string().trim().min(1).max(64),
});

export type CreateSubscriptionInput = z.infer<
  typeof createSubscriptionInputSchema
>;
