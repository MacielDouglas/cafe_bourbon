import type { Product } from "@/modules/catalog/domain/product";
import type { ProductRepository } from "@/modules/catalog/domain/repository";
import type { ProductType } from "@/modules/catalog/domain/value-objects";
import {
  type PairingCalculation,
  type PairingService,
} from "@/modules/pairing/domain/pairing-service";

export interface CalculatedPairing {
  product: Product;
  calculation: PairingCalculation;
}

export interface GetCalculatedPairingsInput {
  productId: string;
  limit?: number;
}

const COMPLEMENTARY_TYPES: Record<ProductType, ProductType[]> = {
  COFFEE: ["CHEESE", "WINE"],
  CHEESE: ["COFFEE", "WINE"],
  WINE: ["COFFEE", "CHEESE"],
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

function clampLimit(limit: number | undefined): number {
  if (!limit || !Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
}

export class GetCalculatedPairings {
  constructor(
    private readonly products: ProductRepository,
    private readonly service: PairingService,
  ) {}

  async execute(input: GetCalculatedPairingsInput): Promise<CalculatedPairing[]> {
    const productId = input.productId.trim();
    if (!productId) return [];

    const [base] = await this.products.findByIds([productId]);
    if (!base) return [];

    const candidates: Product[] = [];
    for (const type of COMPLEMENTARY_TYPES[base.type]) {
      const page = await this.products.list({
        type,
        availableOnly: true,
        pageSize: MAX_LIMIT,
      });
      candidates.push(...page.items);
    }

    const results = candidates
      .filter((candidate) => candidate.id.value !== base.id.value)
      .map((candidate) => ({
        product: candidate,
        calculation: this.service.calculatePair(base, candidate),
      }))
      .filter((entry) => entry.calculation.displayable);

    results.sort(
      (a, b) => b.calculation.score.value - a.calculation.score.value,
    );

    return results.slice(0, clampLimit(input.limit));
  }
}
