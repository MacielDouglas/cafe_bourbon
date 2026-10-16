import { connection } from "next/server";
import { z } from "zod";
import { pairingUseCases } from "@/modules/pairing/presentation/composition";

const querySchema = z.object({
  productId: z.string().trim().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export async function GET(request: Request) {
  await connection();

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    productId: url.searchParams.get("productId") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Parâmetros inválidos.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const { getPairingRecommendations } = pairingUseCases();
    const pairings = await getPairingRecommendations.execute({
      ...(parsed.data.productId ? { productId: parsed.data.productId } : {}),
      ...(parsed.data.limit ? { limit: parsed.data.limit } : {}),
    });

    return Response.json({
      pairings: pairings.map((pairing) => ({
        id: pairing.id,
        productIds: pairing.productIds,
        origin: pairing.origin,
        score: pairing.score.value,
        tier: pairing.score.tier,
        explanation: pairing.explanation,
        criteria: pairing.criteria,
      })),
    });
  } catch {
    return Response.json(
      { error: "Não foi possível carregar as harmonizações." },
      { status: 503 },
    );
  }
}
