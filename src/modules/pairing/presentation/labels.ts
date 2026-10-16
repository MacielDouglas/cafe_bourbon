import type { PairingOrigin } from "@/modules/pairing/domain/pairing";

export type PairingTier = "experimental" | "moderada" | "boa" | "excelente";

export const pairingTierLabel: Record<PairingTier, string> = {
  excelente: "Excelente",
  boa: "Boa",
  moderada: "Moderada",
  experimental: "Experimental",
};

export const pairingOriginLabel: Record<PairingOrigin, string> = {
  EDITORIAL: "Curadoria editorial",
  CALCULATED: "Sugestão calculada",
};

export const pairingRuleLabel: Record<string, string> = {
  "intensity-balance": "Equilíbrio de intensidade",
  "body-complement": "Corpo × textura",
  "acidity-harmony": "Acidez em harmonia",
  "shared-notes": "Notas em comum",
  "sweet-rich-contrast": "Contraste doce × curado",
  "sweet-tannin-contrast": "Contraste doce × tanino",
  "fat-acid-contrast": "Contraste gordura × acidez",
  "editorial-curation": "Curadoria editorial",
  availability: "Disponibilidade",
  "trio-linking-note": "Nota que liga o trio",
};

/** Rótulo legível de um critério, tolerando prefixos de pares em trincas. */
export function pairingRuleText(rule: string): string {
  const normalized = rule.replace(/^pair\[[^\]]+\]\s*/, "");
  return pairingRuleLabel[normalized] ?? normalized;
}
