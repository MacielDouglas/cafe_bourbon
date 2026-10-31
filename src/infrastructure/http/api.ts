import type { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { DomainError } from "@/modules/shared/domain/errors";

/** Contexto de rotas dinâmicas com um único segmento `[id]`. */
export interface IdRouteContext {
  params: Promise<{ id: string }>;
}

export type ParsedBody<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response };

/**
 * Lê o corpo JSON e valida com Zod. Em falha devolve a resposta 400 padronizada
 * já pronta, permitindo `return parsed.response`.
 */
export async function parseBody<T>(
  schema: z.ZodType<T>,
  request: Request,
  invalidMessage = "Payload inválido.",
): Promise<ParsedBody<T>> {
  const payload: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      response: Response.json(
        { error: invalidMessage, issues: parsed.error.issues },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: parsed.data };
}

/**
 * Converte erro capturado em resposta HTTP:
 * `DomainError` → 422 com a mensagem de domínio; qualquer outro → `fallback` com 503.
 */
export function domainErrorResponse(error: unknown, fallback: string): Response {
  if (error instanceof DomainError) {
    return Response.json({ error: error.message }, { status: 422 });
  }
  return Response.json({ error: fallback }, { status: 503 });
}

/**
 * Identifica o IP do cliente pelo último hop de `X-Forwarded-For`.
 *
 * Cada proxy anexa o IP que recebeu, então o último valor é o adicionado pelo
 * proxy de confiança; os anteriores vêm do cliente e podem ser forjados.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const trusted = hops.at(-1);
    if (trusted) return trusted;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Aplica rate limit por `scope` + IP (ou `subkey`, quando o recurso tem
 * identidade própria). Devolve `null` quando permitido ou a resposta 429.
 */
export function rateLimitResponse(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
  options?: { subkey?: string; message?: string },
): Response | null {
  const subject = options?.subkey ?? clientIp(request);
  const gate = checkRateLimit(`${scope}:${subject}`, limit, windowMs);
  if (gate.allowed) return null;
  return Response.json(
    {
      error:
        options?.message ?? "Muitas requisições em pouco tempo. Aguarde.",
    },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(gate.retryAfterMs / 1000)) },
    },
  );
}
