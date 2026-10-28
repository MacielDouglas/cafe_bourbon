import { z } from "zod";

const internalPathSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (value) =>
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("\\") &&
      !value.includes("://"),
    { message: "Destino inválido" },
  );

/** Aceita apenas caminhos internos; qualquer outra entrada cai no fallback. */
export function safeRedirectPath(
  raw: string | string[] | undefined,
  fallback = "/",
): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = internalPathSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}
