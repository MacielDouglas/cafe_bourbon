import type { DiscoveryCategory } from "@/modules/discovery/domain/taste-profile";
import type { PairingTier } from "@/modules/pairing/presentation/labels";

export interface CategoryOption {
  value: DiscoveryCategory;
  label: string;
}

export const discoveryCategoryOptions: CategoryOption[] = [
  { value: "COFFEE", label: "Cafés" },
  { value: "CHEESE", label: "Queijos" },
  { value: "WINE", label: "Vinhos" },
];

/** Notas que aparecem no seed — garantem interseção com o catálogo real. */
export const discoveryNoteSuggestions = [
  "caramelo",
  "nozes",
  "especiarias",
  "melado",
  "framboesa",
  "amêndoa",
  "manteiga",
  "frutas",
];

export const discoveryScoreTierLabel: Record<PairingTier, string> = {
  excelente: "Combina muito",
  boa: "Combina bem",
  moderada: "Combinação possível",
  experimental: "Vale experimentar",
};
