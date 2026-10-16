import type { Product } from "@/modules/catalog/domain/product";
import type {
  BrewMethod,
  ProductType,
} from "@/modules/catalog/domain/value-objects";

export const productTypeLabel: Record<ProductType, string> = {
  COFFEE: "Café",
  CHEESE: "Queijo",
  WINE: "Vinho",
};

export const productTypePluralLabel: Record<ProductType, string> = {
  COFFEE: "Cafés",
  CHEESE: "Queijos",
  WINE: "Vinhos",
};

export const brewMethodLabel: Record<BrewMethod, string> = {
  EXPRESSO: "Expresso",
  COADO: "Coado",
  MOKA: "Moka",
  FRENCH_PRESS: "French press",
  AEROPRESS: "Aeropress",
};

const roastLabel: Record<number, string> = {
  1: "Clara",
  2: "Média-clara",
  3: "Média",
  4: "Média-escura",
  5: "Escura",
};

export interface ProductSpec {
  label: string;
  value: string;
}

/** Ficha técnica do produto derivada do perfil de domínio. */
export function productSpecs(product: Product): ProductSpec[] {
  const { profile } = product;
  switch (profile.kind) {
    case "COFFEE": {
      const specs: ProductSpec[] = [
        { label: "Origem", value: profile.origin },
        { label: "Torra", value: roastLabel[profile.roastLevel] ?? `${profile.roastLevel}/5` },
      ];
      if (profile.variety) specs.push({ label: "Variedade", value: profile.variety });
      if (profile.process) specs.push({ label: "Processo", value: profile.process });
      return specs;
    }
    case "CHEESE": {
      const specs: ProductSpec[] = [
        { label: "Leite", value: profile.milkType },
        { label: "Estilo", value: profile.style },
        { label: "Textura", value: profile.texture },
      ];
      if (profile.agingDays !== null) {
        specs.push({ label: "Maturação", value: `${profile.agingDays} dias` });
      }
      if (profile.origin) specs.push({ label: "Origem", value: profile.origin });
      return specs;
    }
    case "WINE": {
      const specs: ProductSpec[] = [
        { label: "Uvas", value: profile.grapes.join(", ") },
        { label: "Estilo", value: profile.style },
      ];
      if (profile.region) specs.push({ label: "Região", value: profile.region });
      if (profile.vintage !== null) {
        specs.push({ label: "Safra", value: String(profile.vintage) });
      }
      if (profile.alcoholPct !== null) {
        specs.push({ label: "Teor alcoólico", value: `${profile.alcoholPct}%` });
      }
      return specs;
    }
  }
}

/** Linha descritiva curta do produto, usada nas fichas do catálogo. */
export function productSubtitle(product: Product): string {
  const { profile } = product;
  switch (profile.kind) {
    case "COFFEE":
      return profile.origin;
    case "CHEESE":
      return `${profile.style} · leite de ${profile.milkType.toLowerCase()}`;
    case "WINE":
      return [profile.style, profile.grapes.join(", ")]
        .filter(Boolean)
        .join(" · ");
  }
}
