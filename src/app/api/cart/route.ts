import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { commerceUseCases } from "@/modules/commerce/presentation/composition";
import {
  ensureCartIdentity,
  readCartIdentity,
} from "@/modules/commerce/presentation/identity";
import { serializeCart } from "@/modules/commerce/presentation/serialize";
import { DomainError } from "@/modules/shared/domain/errors";

const addSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  quantity: z.coerce.number().int().min(1).max(99).optional(),
});

const setSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  quantity: z.coerce.number().int().min(0).max(99),
});

function domainError(error: unknown): Response | null {
  if (error instanceof DomainError) {
    return Response.json({ error: error.message }, { status: 422 });
  }
  return null;
}

export async function GET() {
  await connection();
  const { getCart } = commerceUseCases();
  const summary = await getCart.execute(await readCartIdentity());
  return Response.json(serializeCart(summary));
}

export async function POST(request: Request) {
  await connection();
  const parsed = addSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Payload inválido.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const { getCart, manageCart } = commerceUseCases();
    const identity = await ensureCartIdentity();
    await manageCart.add(
      identity,
      parsed.data.productId,
      parsed.data.quantity ?? 1,
    );
    revalidatePath("/carrinho");
    return Response.json(serializeCart(await getCart.execute(identity)));
  } catch (error) {
    return (
      domainError(error) ??
      Response.json(
        { error: "Não foi possível adicionar ao carrinho." },
        { status: 503 },
      )
    );
  }
}

export async function PATCH(request: Request) {
  await connection();
  const parsed = setSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Payload inválido.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const { getCart, manageCart } = commerceUseCases();
    const identity = await ensureCartIdentity();
    await manageCart.setQuantity(
      identity,
      parsed.data.productId,
      parsed.data.quantity,
    );
    revalidatePath("/carrinho");
    return Response.json(serializeCart(await getCart.execute(identity)));
  } catch (error) {
    return (
      domainError(error) ??
      Response.json(
        { error: "Não foi possível atualizar o carrinho." },
        { status: 503 },
      )
    );
  }
}

export async function DELETE(request: Request) {
  await connection();
  const productId = new URL(request.url).searchParams.get("productId");
  const { getCart, manageCart } = commerceUseCases();
  const identity = await ensureCartIdentity();

  if (productId) {
    await manageCart.remove(identity, productId);
  } else {
    await manageCart.clear(identity);
  }

  revalidatePath("/carrinho");
  return Response.json(serializeCart(await getCart.execute(identity)));
}
