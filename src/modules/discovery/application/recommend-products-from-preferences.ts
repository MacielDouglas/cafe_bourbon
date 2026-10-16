import type { Product } from "@/modules/catalog/domain/product";
import type { ProductRepository } from "@/modules/catalog/domain/repository";
import type { ProductType } from "@/modules/catalog/domain/value-objects";
import type { DiscoveryMatch } from "@/modules/discovery/domain/discovery-score";
import type { DiscoveryService } from "@/modules/discovery/domain/discovery-service";
import type { TasteProfile } from "@/modules/discovery/domain/taste-profile";

export interface RecommendInput {
  profile: TasteProfile;
  limit?: number;
}

export interface RecommendationResult {
  recommendations: DiscoveryMatch[];
  fallback: boolean;
  reason: string | null;
}

export const MIN_RECOMMENDATION_SCORE = 40;

const ALL_TYPES: ProductType[] = ["COFFEE", "CHEESE", "WINE"];
const MAX_PAGE_SIZE = 50;
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 24;

function clampLimit(limit: number | undefined): number {
  if (!limit || !Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
}

export class RecommendProductsFromPreferences {
  constructor(
    private readonly products: ProductRepository,
    private readonly service: DiscoveryService,
  ) {}

  async execute(input: RecommendInput): Promise<RecommendationResult> {
    const limit = clampLimit(input.limit);
    const profile = input.profile;
    const types =
      profile.categories.length > 0 ? profile.categories : ALL_TYPES;

    const candidates = await this.collect(types);
    const ranked = this.service.rank(candidates, profile, limit);

    const strong = ranked.filter(
      (match) => match.score.value >= MIN_RECOMMENDATION_SCORE,
    );
    if (strong.length > 0) {
      return { recommendations: strong, fallback: false, reason: null };
    }

    if (ranked.length > 0) {
      return {
        recommendations: ranked,
        fallback: true,
        reason:
          "Não encontramos um encaixe perfeito; estas são as opções mais próximas do seu perfil.",
      };
    }

    const broad = await this.collect(ALL_TYPES);
    const fallback = this.service.rank(
      broad,
      { ...profile, categories: [], maxPriceCents: null },
      limit,
    );
    return {
      recommendations: fallback,
      fallback: true,
      reason:
        "Ampliamos as coleções e o limite de preço para você não sair de mãos vazias.",
    };
  }

  private async collect(types: readonly ProductType[]): Promise<Product[]> {
    const items: Product[] = [];
    const seen = new Set<string>();
    for (const type of types) {
      const page = await this.products.list({
        type,
        availableOnly: true,
        pageSize: MAX_PAGE_SIZE,
      });
      for (const product of page.items) {
        if (!seen.has(product.id.value)) {
          seen.add(product.id.value);
          items.push(product);
        }
      }
    }
    return items;
  }
}
