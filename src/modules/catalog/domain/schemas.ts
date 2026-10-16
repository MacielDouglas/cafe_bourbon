import { z } from "zod";
import {
  brewMethodSchema,
  sensoryNoteSchema,
  scaleSchema,
} from "@/modules/catalog/domain/value-objects";

export const coffeeProfileSchema = z.object({
  kind: z.literal("COFFEE"),
  origin: z.string().trim().min(2).max(120),
  variety: z.string().trim().min(1).max(60).nullable(),
  process: z.string().trim().min(1).max(60).nullable(),
  roastLevel: scaleSchema,
  intensity: scaleSchema,
  acidity: scaleSchema,
  body: scaleSchema,
  notes: z.array(sensoryNoteSchema).min(1).max(12),
  brewMethods: z.array(brewMethodSchema).min(1).max(5),
});

export const cheeseProfileSchema = z.object({
  kind: z.literal("CHEESE"),
  milkType: z.string().trim().min(2).max(40),
  style: z.string().trim().min(2).max(60),
  agingDays: z.number().int().min(0).max(3650).nullable(),
  texture: z.string().trim().min(2).max(40),
  intensity: scaleSchema,
  acidity: scaleSchema.nullable(),
  notes: z.array(sensoryNoteSchema).min(1).max(12),
  origin: z.string().trim().min(2).max(120).nullable(),
});

export const wineProfileSchema = z.object({
  kind: z.literal("WINE"),
  grapes: z.array(z.string().trim().min(2).max(60)).min(1).max(5),
  region: z.string().trim().min(2).max(120).nullable(),
  style: z.string().trim().min(2).max(60),
  vintage: z.number().int().min(1900).max(2100).nullable(),
  body: scaleSchema,
  acidity: scaleSchema,
  tannins: scaleSchema.nullable(),
  notes: z.array(sensoryNoteSchema).min(1).max(12),
  alcoholPct: z
    .number()
    .min(0)
    .max(100)
    .nullable(),
});

export const productProfileSchema = z.discriminatedUnion("kind", [
  coffeeProfileSchema,
  cheeseProfileSchema,
  wineProfileSchema,
]);

export type CoffeeProfile = z.infer<typeof coffeeProfileSchema>;
export type CheeseProfile = z.infer<typeof cheeseProfileSchema>;
export type WineProfile = z.infer<typeof wineProfileSchema>;
export type ProductProfile = z.infer<typeof productProfileSchema>;

export const productInputSchema = z.object({
  id: z.string().trim().min(1).max(64),
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug deve ser minúsculo com hífens"),
  description: z.string().trim().min(10).max(2000),
  type: z.enum(["COFFEE", "CHEESE", "WINE"]),
  priceCents: z.number().int().min(0).max(100_000_000).nullable(),
  imageUrl: z.string().trim().min(1).max(300).nullable(),
  available: z.boolean(),
  isDemoData: z.boolean(),
  profile: productProfileSchema,
});

export type ProductInput = z.infer<typeof productInputSchema>;
