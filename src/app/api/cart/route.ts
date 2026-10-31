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
  readCartIdentity,
} from "@/modules/commerce/presentation/identity";
import { serializeCart } from "@/modules/commerce/presentation/serialize";

const addSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  quantity: z.coerce.number().int().min(1).max(99).optional(),
});

const setSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  quantity: z.coerce.number().int().min(0).max(99),
});

const removeSchema = z.object({
  productId: z.string().trim().min(1).max(64),
});

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

export async function GET() {
  await connection();
  const { getCart } = commerceUseCases();
  const summary = await getCart.execute(await readCartIdentity());
  return Response.json(serializeCart(summary));
}

export async function POST(request: Request) {
  await connection();
  const blocked = rateLimitResponse(request, "cart", RATE_LIMIT, RATE_WINDOW_MS, {
    subkey: cartCookieKey(request),
  });
  if (blocked) return blocked;

  const parsed = await parseBody(addSchema, request);
  if (!parsed.ok) return parsed.response;

  try {
    const { getCart, manageCart } = commerceUseCases();
    const identity = await ensureCartIdentity();
    await manageCart.add(identity, parsed.data.productId, parsed.data.quantity ?? 1);
    revalidatePath("/carrinho");
    return Response.json(serializeCart(await getCart.execute(identity)));
  } catch (error) {
    return domainErrorResponse(error, "Não foi possível adicionar ao carrinho.");
  }
}

export async function PATCH(request: Request) {
  await connection();
  const blocked = rateLimitResponse(request, "cart", RATE_LIMIT, RATE_WINDOW_MS, {
    subkey: cartCookieKey(request),
  });
  if (blocked) return blocked;

  const parsed = await parseBody(setSchema, request);
  if (!parsed.ok) return parsed.response;

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
    return domainErrorResponse(error, "Não foi possível atualizar o carrinho.");
  }
}

export async function DELETE(request: Request) {
  await connection();
  const blocked = rateLimitResponse(request, "cart", RATE_LIMIT, RATE_WINDOW_MS, {
    subkey: cartCookieKey(request),
  });
  if (blocked) return blocked;

  const rawProductId = new URL(request.url).searchParams.get("productId");
  let productId: string | null = null;
  if (rawProductId !== null) {
    const parsed = removeSchema.safeParse({ productId: rawProductId });
    if (!parsed.success) {
      return Response.json(
        { error: "Produto inválido.", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    productId = parsed.data.productId;
  }

  try {
    const { getCart, manageCart } = commerceUseCases();
    const identity = await ensureCartIdentity();
    if (productId) {
      await manageCart.remove(identity, productId);
    } else {
      await manageCart.clear(identity);
    }
    revalidatePath("/carrinho");
    return Response.json(serializeCart(await getCart.execute(identity)));
  } catch (error) {
    return domainErrorResponse(error, "Não foi possível atualizar o carrinho.");
  }
}
