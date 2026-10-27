import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { commerceUseCases } from "@/modules/commerce/presentation/composition";
import { ensureCartIdentity } from "@/modules/commerce/presentation/identity";
import { serializeCart } from "@/modules/commerce/presentation/serialize";
import { DomainError } from "@/modules/shared/domain/errors";

const kitSchema = z.object({
  productIds: z
    .array(z.string().trim().min(1).max(64))
    .min(2)
    .max(3),
});

export async function POST(request: Request) {
  await connection();
  const parsed = kitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Kit inválido.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const { getCart, manageCart } = commerceUseCases();
    const identity = await ensureCartIdentity();
    await manageCart.addKit(identity, parsed.data.productIds);
    revalidatePath("/carrinho");
    return Response.json(serializeCart(await getCart.execute(identity)));
  } catch (error) {
    if (error instanceof DomainError) {
      return Response.json({ error: error.message }, { status: 422 });
    }
    return Response.json(
      { error: "Não foi possível adicionar o kit ao carrinho." },
      { status: 503 },
    );
  }
}
