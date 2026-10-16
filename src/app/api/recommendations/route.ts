import { connection } from "next/server";
import {
  productSubtitle,
  productTypeLabel,
} from "@/modules/catalog/presentation/labels";
import { tasteProfileSchema } from "@/modules/discovery/domain/taste-profile";
import { discoveryUseCases } from "@/modules/discovery/presentation/composition";

export async function POST(request: Request) {
  await connection();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = tasteProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Perfil de paladar inválido.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const { recommendProductsFromPreferences } = discoveryUseCases();
    const result = await recommendProductsFromPreferences.execute({
      profile: parsed.data,
      limit: 8,
    });

    return Response.json({
      fallback: result.fallback,
      reason: result.reason,
      recommendations: result.recommendations.map(({ product, score }) => ({
        slug: product.slug,
        name: product.name,
        type: product.type,
        typeLabel: productTypeLabel[product.type],
        subtitle: productSubtitle(product),
        priceCents: product.price?.cents ?? null,
        isDemoData: product.isDemoData,
        score: score.value,
        tier: score.tier,
        reason: score.reason,
      })),
    });
  } catch {
    return Response.json(
      { error: "Não foi possível gerar recomendações." },
      { status: 503 },
    );
  }
}
