import { connection } from "next/server";
import { z } from "zod";
import { rateLimitResponse } from "@/infrastructure/http/api";
import { assistantUseCases } from "@/modules/assistant/presentation/composition";
import { catalogUseCases } from "@/modules/catalog/presentation/composition";

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
});

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  await connection();

  const blocked = rateLimitResponse(
    request,
    "chat",
    RATE_LIMIT,
    RATE_WINDOW_MS,
    { message: "Muitas mensagens em pouco tempo. Aguarde um instante." },
  );
  if (blocked) return blocked;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Mensagem inválida (1 a 1000 caracteres).", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const { askVirtualBarista } = assistantUseCases();
    const result = await askVirtualBarista.execute({
      message: parsed.data.message,
    });

    const { getProductDetails } = catalogUseCases();
    const details = await Promise.all(
      result.productSlugs.map((slug) => getProductDetails.execute(slug)),
    );
    const productNames: Record<string, string> = {};
    for (const product of details) {
      if (product) productNames[product.slug] = product.name;
    }

    return Response.json({ ...result, productNames });
  } catch {
    return Response.json(
      { error: "O assistente está indisponível agora." },
      { status: 503 },
    );
  }
}
