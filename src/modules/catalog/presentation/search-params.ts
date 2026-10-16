import { z } from "zod";

export const catalogSearchParamsSchema = z.object({
  tipo: z.enum(["COFFEE", "CHEESE", "WINE"]).optional(),
  busca: z.string().trim().min(1).max(80).optional(),
  pagina: z.coerce.number().int().min(1).max(10_000).optional(),
});

export type CatalogSearchParams = z.infer<typeof catalogSearchParamsSchema>;

/** Valida os searchParams (string | string[]) do Next com Zod, tolerando lixo. */
export function parseCatalogSearchParams(
  raw: Record<string, string | string[] | undefined>,
): CatalogSearchParams {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") flat[key] = value;
  }
  const parsed = catalogSearchParamsSchema.safeParse(flat);
  return parsed.success ? parsed.data : {};
}
