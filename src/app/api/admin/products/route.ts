import { connection } from "next/server";
import { requireOwnerApi } from "@/infrastructure/auth/api-guard";
import { catalogAdminUseCases } from "@/modules/catalog/presentation/composition";
import { DomainError } from "@/modules/shared/domain/errors";

export async function POST(request: Request) {
  await connection();
  const guard = await requireOwnerApi();
  if (guard.response) return guard.response;

  const parsed = await request.json().catch(() => null);
  if (parsed === null) {
    return Response.json({ error: "Payload inválido." }, { status: 400 });
  }

  try {
    const { manageProducts } = catalogAdminUseCases();
    const product = await manageProducts.create(parsed);
    return Response.json({ id: product.id.value }, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return Response.json({ error: error.message }, { status: 422 });
    }
    return Response.json(
      { error: "Não foi possível criar o produto." },
      { status: 503 },
    );
  }
}
