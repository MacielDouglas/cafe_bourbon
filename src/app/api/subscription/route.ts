import { connection } from "next/server";
import { createSubscriptionInputSchema } from "@/modules/commerce/domain/subscription";
import { commerceUseCases } from "@/modules/commerce/presentation/composition";
import { currentUserId } from "@/modules/commerce/presentation/identity";
import { DomainError } from "@/modules/shared/domain/errors";

export async function POST(request: Request) {
  await connection();

  const userId = await currentUserId();
  if (!userId) {
    return Response.json(
      { error: "Faça login para assinar um plano." },
      { status: 401 },
    );
  }

  const parsed = createSubscriptionInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json(
      { error: "Dados da assinatura inválidos.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const { createSubscription } = commerceUseCases();
    const { record, plan } = await createSubscription.execute(
      userId,
      parsed.data,
    );

    return Response.json(
      {
        subscription: {
          id: record.id,
          plan: record.plan,
          planName: plan.name,
          cadence: plan.cadence,
          priceLabel: plan.priceCents,
          grind: record.grind,
          brewMethod: record.brewMethod,
          coffeeId: record.coffeeId,
          status: record.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DomainError) {
      return Response.json({ error: error.message }, { status: 422 });
    }
    return Response.json(
      { error: "Não foi possível concluir a assinatura." },
      { status: 503 },
    );
  }
}
