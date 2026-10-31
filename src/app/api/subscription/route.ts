import { connection } from "next/server";
import { createSubscriptionInputSchema } from "@/modules/commerce/domain/subscription";
import {
  domainErrorResponse,
  parseBody,
  rateLimitResponse,
} from "@/infrastructure/http/api";
import { commerceUseCases } from "@/modules/commerce/presentation/composition";
import { currentUserId } from "@/modules/commerce/presentation/identity";

export async function POST(request: Request) {
  await connection();

  const userId = await currentUserId();
  if (!userId) {
    return Response.json(
      { error: "Faça login para assinar um plano." },
      { status: 401 },
    );
  }

  const blocked = rateLimitResponse(request, "subscription", 15, 60_000, {
    subkey: userId,
    message: "Muitas tentativas de assinatura. Aguarde um instante.",
  });
  if (blocked) return blocked;

  const parsed = await parseBody(
    createSubscriptionInputSchema,
    request,
    "Dados da assinatura inválidos.",
  );
  if (!parsed.ok) return parsed.response;

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
    return domainErrorResponse(error, "Não foi possível concluir a assinatura.");
  }
}
