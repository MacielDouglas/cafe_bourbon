import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  domainErrorResponse,
  parseBody,
  rateLimitResponse,
} from "@/infrastructure/http/api";
import { commerceUseCases } from "@/modules/commerce/presentation/composition";
import {
  cartCookieKey,
  ensureCartIdentity,
} from "@/modules/commerce/presentation/identity";
import { serializeCart } from "@/modules/commerce/presentation/serialize";

const kitSchema = z.object({
  productIds: z
    .array(z.string().trim().min(1).max(64))
    .min(2)
    .max(3),
});

export async function POST(request: Request) {
  await connection();
  const blocked = rateLimitResponse(request, "cart-kit", 60, 60_000, {
    subkey: cartCookieKey(request),
  });
  if (blocked) return blocked;

  const parsed = await parseBody(kitSchema, request, "Kit inválido.");
  if (!parsed.ok) return parsed.response;

  try {
    const { getCart, manageCart } = commerceUseCases();
    const identity = await ensureCartIdentity();
    await manageCart.addKit(identity, parsed.data.productIds);
    revalidatePath("/carrinho");
    return Response.json(serializeCart(await getCart.execute(identity)));
  } catch (error) {
    return domainErrorResponse(error, "Não foi possível adicionar o kit ao carrinho.");
  }
}
