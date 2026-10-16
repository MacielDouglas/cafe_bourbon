import type { Product } from "@/modules/catalog/domain/product";

export interface DiscoveryCriterion {
  rule: string;
  points: number;
  max: number;
  detail: string;
}

export class DiscoveryScore {
  private constructor(
    readonly value: number,
    readonly criteria: readonly DiscoveryCriterion[],
    readonly reason: string,
  ) {}

  static of(
    value: number,
    criteria: readonly DiscoveryCriterion[],
    reason: string,
  ): DiscoveryScore {
    const rounded = Math.round(value);
    return new DiscoveryScore(
      Math.min(100, Math.max(0, rounded)),
      criteria,
      reason,
    );
  }

  get tier(): "experimental" | "moderada" | "boa" | "excelente" {
    if (this.value >= 80) return "excelente";
    if (this.value >= 60) return "boa";
    if (this.value >= 40) return "moderada";
    return "experimental";
  }
}

export interface DiscoveryMatch {
  product: Product;
  score: DiscoveryScore;
}
