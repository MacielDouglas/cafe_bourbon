import type { Pairing as PairingRecord } from "@prisma/client";
import { z } from "zod";
import { Pairing, pairingCriterionSchema } from "@/modules/pairing/domain/pairing";
import { DomainError } from "@/modules/shared/domain/errors";

const originSchema = z.enum(["EDITORIAL", "CALCULATED"]);

export function toDomainPairing(record: PairingRecord): Pairing {
  const origin = originSchema.safeParse(record.origin);
  if (!origin.success) {
    throw new DomainError(`Origem de harmonização inválida em ${record.id}.`);
  }
  const criteria = z
    .array(pairingCriterionSchema)
    .safeParse(record.criteria);
  if (!criteria.success) {
    throw new DomainError(`Critérios de harmonização inválidos em ${record.id}.`);
  }
  return Pairing.create({
    id: record.id,
    productIds: record.productIds,
    origin: origin.data,
    score: record.score,
    criteria: criteria.data,
    explanation: record.explanation,
    published: record.published,
  });
}
