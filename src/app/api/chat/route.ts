import { connection } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { assistantUseCases } from "@/modules/assistant/presentation/composition";

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
});

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  await connection();

  const gate = checkRateLimit(
    `chat:${clientIp(request)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (!gate.allowed) {
    return Response.json(
      { error: "Muitas mensagens em pouco tempo. Aguarde um instante." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(gate.retryAfterMs / 1000)),
        },
      },
    );
  }

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
    return Response.json(result);
  } catch {
    return Response.json(
      { error: "O assistente está indisponível agora." },
      { status: 503 },
    );
  }
}
