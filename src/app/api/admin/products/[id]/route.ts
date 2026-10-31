import { connection } from "next/server";
import { requireOwnerApi } from "@/infrastructure/auth/api-guard";
import {
  domainErrorResponse,
  type IdRouteContext,
} from "@/infrastructure/http/api";
import { catalogAdminUseCases } from "@/modules/catalog/presentation/composition";

export async function PUT(request: Request, context: IdRouteContext) {
  await connection();
  const guard = await requireOwnerApi();
  if (guard.response) return guard.response;

  const { id } = await context.params;
  const body: unknown = await request.json().catch(() => null);
  if (body === null) {
    return Response.json({ error: "Payload inválido." }, { status: 400 });
  }

  try {
    const { manageProducts } = catalogAdminUseCases();
    const product = await manageProducts.update(id, body);
    return Response.json({ id: product.id.value });
  } catch (error) {
    return domainErrorResponse(error, "Não foi possível atualizar o produto.");
  }
}

export async function PATCH(request: Request, context: IdRouteContext) {
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
    return domainErrorResponse(error, "Não foi possível atualizar o produto.");
  }
}

export async function DELETE(_request: Request, context: IdRouteContext) {
  await connection();
  const guard = await requireOwnerApi();
  if (guard.response) return guard.response;

  const { id } = await context.params;
  try {
    const { manageProducts } = catalogAdminUseCases();
    await manageProducts.delete(id);
    return Response.json({ ok: true });
  } catch (error) {
    return domainErrorResponse(error, "Não foi possível excluir o produto.");
  }
}
