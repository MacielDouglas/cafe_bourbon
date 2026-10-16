import { z } from "zod";

export const pairingSearchParamsSchema = z.object({
  cafe: z.string().trim().min(1).max(120).optional(),
});

export type PairingSearchParams = z.infer<typeof pairingSearchParamsSchema>;

/** Valida os searchParams do Next com Zod, tolerando valores ausentes ou lixo. */
export function parsePairingSearchParams(
  raw: Record<string, string | string[] | undefined>,
): PairingSearchParams {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") flat[key] = value;
  }
  const parsed = pairingSearchParamsSchema.safeParse(flat);
  return parsed.success ? parsed.data : {};
}
