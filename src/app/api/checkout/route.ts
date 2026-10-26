import { connection } from "next/server";
import { currentUser } from "@/infrastructure/auth/authorization";
import { commerceUseCases } from "@/modules/commerce/presentation/composition";
import { ensureCartIdentity } from "@/modules/commerce/presentation/identity";
import { DomainError } from "@/modules/shared/domain/errors";

export async function POST() {
  await connection();
  const user = await currentUser();
  if (!user) {
    return Response.json(
      { error: "Entre na sua conta para finalizar o pedido." },
      { status: 401 },
    );
  }

  const identity = await ensureCartIdentity();
  try {
    const { createOrder } = commerceUseCases();
    const order = await createOrder.execute(identity, {
      name: user.name,
      email: user.email,
    });
    return Response.json({
      order: {
        id: order.id,
        totalCents: order.totalCents,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return Response.json({ error: error.message }, { status: 422 });
    }
    return Response.json(
      { error: "Não foi possível concluir o pedido." },
      { status: 503 },
    );
  }
}
