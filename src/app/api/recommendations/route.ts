import { connection } from "next/server";
import {
  parseBody,
  rateLimitResponse,
} from "@/infrastructure/http/api";
import {
  productSubtitle,
  productTypeLabel,
} from "@/modules/catalog/presentation/labels";
import { tasteProfileSchema } from "@/modules/discovery/domain/taste-profile";
import { discoveryUseCases } from "@/modules/discovery/presentation/composition";

export async function POST(request: Request) {
  await connection();

  const blocked = rateLimitResponse(request, "recommendations", 30, 60_000, {
    message: "Muitas recomendações em pouco tempo. Aguarde um instante.",
  });
  if (blocked) return blocked;

  const parsed = await parseBody(tasteProfileSchema, request, "Perfil de paladar inválido.");
  if (!parsed.ok) return parsed.response;

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
