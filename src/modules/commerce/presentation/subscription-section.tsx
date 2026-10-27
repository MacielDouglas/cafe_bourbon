import { connection } from "next/server";
import { StateLink, StateMessage } from "@/components/state-message";
import { catalogUseCases } from "@/modules/catalog/presentation/composition";
import { commerceUseCases } from "@/modules/commerce/presentation/composition";
import { currentUserId } from "@/modules/commerce/presentation/identity";
import { SubscriptionForm } from "@/modules/commerce/presentation/subscription-form";

interface CoffeeOption {
  id: string;
  name: string;
}

export async function SubscriptionSection() {
  await connection();

  const { listSubscriptionPlans } = commerceUseCases();
  const { listProducts } = catalogUseCases();

  const plans = listSubscriptionPlans.execute();
  const isAuthenticated = (await currentUserId()) !== null;

  let coffees: CoffeeOption[] | null = null;
  try {
    const result = await listProducts.execute({
      type: "COFFEE",
      availableOnly: true,
      pageSize: 50,
    });
    coffees = result.items.map((coffee) => ({
      id: coffee.id.value,
      name: coffee.name,
    }));
  } catch {
    coffees = null;
  }

  if (!coffees) {
    return (
      <StateMessage
        title="Não conseguimos carregar os planos"
        description="O banco de dados está indisponível no momento. Tente novamente em instantes."
        action={<StateLink href="/produtos">Ver o catálogo</StateLink>}
      />
    );
  }

  return (
    <SubscriptionForm
      plans={plans}
      coffees={coffees}
      isAuthenticated={isAuthenticated}
    />
  );
}
