import { connection } from "next/server";
import { domainErrorResponse } from "@/infrastructure/http/api";
import { requireOwnerApi } from "@/infrastructure/auth/api-guard";
import { catalogAdminUseCases } from "@/modules/catalog/presentation/composition";

export async function POST(request: Request) {
  await connection();
  const guard = await requireOwnerApi();
  if (guard.response) return guard.response;

  const body: unknown = await request.json().catch(() => null);
  if (body === null) {
    return Response.json({ error: "Payload inválido." }, { status: 400 });
  }

  try {
    const { manageProducts } = catalogAdminUseCases();
    const product = await manageProducts.create(body);
    return Response.json({ id: product.id.value }, { status: 201 });
  } catch (error) {
    return domainErrorResponse(error, "Não foi possível criar o produto.");
  }
}
