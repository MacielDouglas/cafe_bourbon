import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import {
  domainErrorResponse,
  rateLimitResponse,
} from "@/infrastructure/http/api";
import { currentUser } from "@/infrastructure/auth/authorization";
import { commerceUseCases } from "@/modules/commerce/presentation/composition";
import { ensureCartIdentity } from "@/modules/commerce/presentation/identity";

export async function POST(request: Request) {
  await connection();
  const user = await currentUser();
  if (!user) {
    return Response.json(
      { error: "Entre na sua conta para finalizar o pedido." },
      { status: 401 },
    );
  }

  const blocked = rateLimitResponse(request, "checkout", 15, 60_000, {
    subkey: user.id,
    message: "Muitas tentativas de compra. Aguarde um instante.",
  });
  if (blocked) return blocked;

  const identity = await ensureCartIdentity();
  try {
    const { createOrder } = commerceUseCases();
    const order = await createOrder.execute(identity, {
      name: user.name,
      email: user.email,
    });
    revalidatePath("/carrinho");
    return Response.json({
      order: {
        id: order.id,
        totalCents: order.totalCents,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    return domainErrorResponse(error, "Não foi possível concluir o pedido.");
  }
}
