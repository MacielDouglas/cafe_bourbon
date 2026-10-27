import { DomainError } from "@/modules/shared/domain/errors";

export const HARMONIZATION_KIT_DISCOUNT_PERCENT = 5;
export const HARMONIZATION_KIT_MIN_PRODUCTS = 2;
export const HARMONIZATION_KIT_MAX_PRODUCTS = 3;

export type HarmonizationProductType = "COFFEE" | "CHEESE" | "WINE";

export interface HarmonizationItem {
  productId: string;
  type: HarmonizationProductType;
  priceCents: number;
  quantity: number;
}

export interface HarmonizationDiscount {
  percent: number;
  kitCount: number;
  totalCents: number;
  discountByProductId: Map<string, number>;
}

interface KitUnit {
  productId: string;
  type: HarmonizationProductType;
  priceCents: number;
}

const KIT_TYPES: readonly HarmonizationProductType[] = [
  "COFFEE",
  "CHEESE",
  "WINE",
];

/** Desconto de um único item do kit (arredondado ao centavo). */
export function percentDiscount(
  priceCents: number,
  percent = HARMONIZATION_KIT_DISCOUNT_PERCENT,
): number {
  if (!Number.isFinite(priceCents) || priceCents <= 0) return 0;
  return Math.round((priceCents * percent) / 100);
}

/**
 * Um kit é formado por 2 ou 3 produtos de categorias diferentes (café, queijo
 * e vinho). Primeiro formamos trios; depois, os pares de maior valor. Cada
 * unidade usada em um kit recebe o desconto, então quantidades maiores podem
 * formar mais de um kit.
 */
export function computeHarmonizationDiscount(
  items: readonly HarmonizationItem[],
  percent = HARMONIZATION_KIT_DISCOUNT_PERCENT,
): HarmonizationDiscount {
  const unitsByType = new Map<HarmonizationProductType, KitUnit[]>();

  for (const item of items) {
    if (item.priceCents <= 0 || item.quantity <= 0) continue;
    const units = unitsByType.get(item.type) ?? [];
    for (let index = 0; index < item.quantity; index++) {
      units.push({
        productId: item.productId,
        type: item.type,
        priceCents: item.priceCents,
      });
    }
    units.sort((first, second) => second.priceCents - first.priceCents);
    unitsByType.set(item.type, units);
  }

  const selected: KitUnit[] = [];
  let kitCount = 0;

  while (KIT_TYPES.every((type) => (unitsByType.get(type)?.length ?? 0) > 0)) {
    for (const type of KIT_TYPES) {
      const unit = unitsByType.get(type)?.shift();
      if (unit) selected.push(unit);
    }
    kitCount += 1;
  }

  for (;;) {
    const availableTypes = KIT_TYPES.filter(
      (type) => (unitsByType.get(type)?.length ?? 0) > 0,
    );
    if (availableTypes.length < 2) break;

    let bestPair: [HarmonizationProductType, HarmonizationProductType] | null =
      null;
    let bestTotal = -1;

    for (let first = 0; first < availableTypes.length; first++) {
      for (let second = first + 1; second < availableTypes.length; second++) {
        const firstUnit = unitsByType.get(availableTypes[first])?.[0];
        const secondUnit = unitsByType.get(availableTypes[second])?.[0];
        if (!firstUnit || !secondUnit) continue;
        const total = firstUnit.priceCents + secondUnit.priceCents;
        if (total > bestTotal) {
          bestTotal = total;
          bestPair = [availableTypes[first], availableTypes[second]];
        }
      }
    }

    if (!bestPair) break;

    const firstUnit = unitsByType.get(bestPair[0])?.shift();
    const secondUnit = unitsByType.get(bestPair[1])?.shift();
    if (firstUnit) selected.push(firstUnit);
    if (secondUnit) selected.push(secondUnit);
    kitCount += 1;
  }

  const discountByProductId = new Map<string, number>();
  let totalCents = 0;

  for (const unit of selected) {
    const discount = percentDiscount(unit.priceCents, percent);
    if (discount <= 0) continue;
    totalCents += discount;
    discountByProductId.set(
      unit.productId,
      (discountByProductId.get(unit.productId) ?? 0) + discount,
    );
  }

  return { percent, kitCount, totalCents, discountByProductId };
}

/** Valida a composição de um kit antes de adicioná-lo ao carrinho. */
export function assertHarmonizationKit(
  items: readonly Pick<HarmonizationItem, "type">[],
): void {
  if (
    items.length < HARMONIZATION_KIT_MIN_PRODUCTS ||
    items.length > HARMONIZATION_KIT_MAX_PRODUCTS
  ) {
    throw new DomainError(
      `Kit de harmonização deve ter ${HARMONIZATION_KIT_MIN_PRODUCTS} ou ${HARMONIZATION_KIT_MAX_PRODUCTS} produtos.`,
    );
  }
  if (new Set(items.map((item) => item.type)).size < 2) {
    throw new DomainError(
      "Kit de harmonização precisa combinar categorias diferentes.",
    );
  }
}
