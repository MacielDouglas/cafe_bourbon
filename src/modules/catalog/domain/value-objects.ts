import { z } from "zod";
import { DomainError } from "@/modules/shared/domain/errors";

export type ProductType = "COFFEE" | "CHEESE" | "WINE";

export type Scale = 1 | 2 | 3 | 4 | 5;

export const scaleSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export function toScale(value: number): Scale {
  const parsed = scaleSchema.safeParse(value);
  if (!parsed.success) {
    throw new DomainError(`Escala sensorial inválida: ${value}`);
  }
  return parsed.data;
}

export function toScaleOrNull(value: number | null): Scale | null {
  return value === null ? null : toScale(value);
}

export const productIdSchema = z.string().trim().min(1).max(64);

export class ProductId {
  private constructor(readonly value: string) {}

  static of(value: string): ProductId {
    const parsed = productIdSchema.safeParse(value);
    if (!parsed.success) {
      throw new DomainError("Identificador de produto inválido.");
    }
    return new ProductId(parsed.data);
  }
}

export const moneySchema = z.object({
  cents: z.number().int().min(0).max(100_000_000),
  currency: z.literal("BRL"),
});

export class Money {
  private constructor(
    readonly cents: number,
    readonly currency: "BRL",
  ) {}

  static cents(cents: number, currency: "BRL" = "BRL"): Money {
    const parsed = moneySchema.safeParse({ cents, currency });
    if (!parsed.success) {
      throw new DomainError("Valor monetário inválido (centavos inteiros >= 0).");
    }
    return new Money(parsed.data.cents, parsed.data.currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainError("Não é possível somar valores de moedas diferentes.");
    }
    return Money.cents(this.cents + other.cents, this.currency);
  }

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new DomainError("Comparação entre moedas diferentes não é suportada.");
    }
    return this.cents > other.cents;
  }
}

export const sensoryNoteSchema = z
  .string()
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.string().min(2).max(40));

export function normalizeNotes(raw: readonly string[]): string[] {
  const parsed = z.array(sensoryNoteSchema).min(1).max(12).safeParse(raw);
  if (!parsed.success) {
    throw new DomainError("Notas sensoriais inválidas.");
  }
  return [...new Set(parsed.data)];
}

export const brewMethodSchema = z.enum([
  "EXPRESSO",
  "COADO",
  "MOKA",
  "FRENCH_PRESS",
  "AEROPRESS",
]);

export type BrewMethod = z.infer<typeof brewMethodSchema>;

export function toBrewMethods(values: readonly string[]): BrewMethod[] {
  const parsed = z.array(brewMethodSchema).min(1).max(5).safeParse(values);
  if (!parsed.success) {
    throw new DomainError("Métodos de preparo inválidos.");
  }
  return parsed.data;
}
