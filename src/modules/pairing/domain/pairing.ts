import { z } from "zod";
import { DomainError } from "@/modules/shared/domain/errors";

export type PairingOrigin = "EDITORIAL" | "CALCULATED";

export const pairingCriterionSchema = z.object({
  rule: z.string().trim().min(2).max(80),
  points: z.number().int().min(0).max(100),
  max: z.number().int().min(1).max(100),
  detail: z.string().trim().min(1).max(300),
});

export type PairingCriterion = z.infer<typeof pairingCriterionSchema>;

export class PairingScore {
  private constructor(readonly value: number) {}

  static of(value: number): PairingScore {
    const rounded = Math.round(value);
    if (!Number.isFinite(rounded) || rounded < 0 || rounded > 100) {
      throw new DomainError(
        `Pontuação de harmonização fora da faixa 0-100: ${value}`,
      );
    }
    return new PairingScore(rounded);
  }

  get tier(): "experimental" | "moderada" | "boa" | "excelente" {
    if (this.value >= 80) return "excelente";
    if (this.value >= 60) return "boa";
    if (this.value >= 40) return "moderada";
    return "experimental";
  }
}

export interface PairingInput {
  id: string;
  productIds: string[];
  origin: PairingOrigin;
  score: number;
  criteria: PairingCriterion[];
  explanation: string;
  published: boolean;
}

export class Pairing {
  private constructor(
    readonly id: string,
    readonly productIds: readonly string[],
    readonly origin: PairingOrigin,
    readonly score: PairingScore,
    readonly criteria: readonly PairingCriterion[],
    readonly explanation: string,
    readonly published: boolean,
  ) {}

  static create(input: PairingInput): Pairing {
    if (input.productIds.length < 2 || input.productIds.length > 3) {
      throw new DomainError("Harmonização deve envolver 2 ou 3 produtos.");
    }
    if (new Set(input.productIds).size !== input.productIds.length) {
      throw new DomainError("Harmonização não pode repetir produtos.");
    }
    const criteria = z
      .array(pairingCriterionSchema)
      .min(1)
      .max(12)
      .safeParse(input.criteria);
    if (!criteria.success) {
      throw new DomainError("Critérios de harmonização inválidos.");
    }
    const explanation = input.explanation.trim();
    if (explanation.length < 10 || explanation.length > 1000) {
      throw new DomainError("Explicação da harmonização inválida.");
    }
    return new Pairing(
      input.id.trim(),
      [...input.productIds],
      input.origin,
      PairingScore.of(input.score),
      criteria.data,
      explanation,
      input.published,
    );
  }
}
