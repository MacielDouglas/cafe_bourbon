import { z } from "zod";
import {
  scaleSchema,
  sensoryNoteSchema,
} from "@/modules/catalog/domain/value-objects";

export const discoveryCategorySchema = z.enum(["COFFEE", "CHEESE", "WINE"]);

export type DiscoveryCategory = z.infer<typeof discoveryCategorySchema>;

export const tasteProfileSchema = z.object({
  intensity: scaleSchema,
  acidity: scaleSchema,
  body: scaleSchema,
  notes: z.array(sensoryNoteSchema).max(8).default([]),
  categories: z.array(discoveryCategorySchema).max(3).default([]),
  maxPriceCents: z
    .number()
    .int()
    .min(0)
    .max(100_000_000)
    .nullable()
    .default(null),
});

export type TasteProfile = z.infer<typeof tasteProfileSchema>;
