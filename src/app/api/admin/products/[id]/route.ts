import { connection } from "next/server";
import { requireOwnerApi } from "@/infrastructure/auth/api-guard";
import { catalogAdminUseCases } from "@/modules/catalog/presentation/composition";
import { DomainError } from "@/modules/shared/domain/errors";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function domainError(error: unknown, fallback: string): Response {
  if (error instanceof DomainError) {
    return Response.json({ error: error.message }, { status: 422 });
  }
  return Response.json({ error: fallback }, { status: 503 });
}

export async function PUT(request: Request, context: RouteContext) {
  await connection();
  const guard = await requireOwnerApi();
  if (guard.response) return guard.response;

  const { id } = await context.params;
  const parsed = await request.json().catch(() => null);
  if (parsed === null) {
    return Response.json({ error: "Payload inválido." }, { status: 400 });
  }

  try {
    const { manageProducts } = catalogAdminUseCases();
    const product = await manageProducts.update(id, parsed);
    return Response.json({ id: product.id.value });
  } catch (error) {
    return domainError(error, "Não foi possível atualizar o produto.");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  await connection();
  const guard = await requireOwnerApi();
  if (guard.response) return guard.response;

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    available?: unknown;
    stock?: unknown;
  } | null;
  if (!body) {
    return Response.json({ error: "Payload inválido." }, { status: 400 });
  }

  try {
    const { manageProducts } = catalogAdminUseCases();
    if (typeof body.available === "boolean") {
      await manageProducts.setAvailability(id, body.available);
    }
    if (typeof body.stock === "number") {
      await manageProducts.setStock(id, body.stock);
    }
    return Response.json({ ok: true });
  } catch (error) {
    return domainError(error, "Não foi possível atualizar o produto.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  await connection();
  const guard = await requireOwnerApi();
  if (guard.response) return guard.response;

  const { id } = await context.params;
  try {
    const { manageProducts } = catalogAdminUseCases();
    await manageProducts.delete(id);
    return Response.json({ ok: true });
  } catch (error) {
    return domainError(error, "Não foi possível excluir o produto.");
  }
}
