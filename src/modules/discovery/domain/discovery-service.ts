import type { Product } from "@/modules/catalog/domain/product";
import {
  type DiscoveryCriterion,
  type DiscoveryMatch,
  DiscoveryScore,
} from "@/modules/discovery/domain/discovery-score";
import type { TasteProfile } from "@/modules/discovery/domain/taste-profile";

const WEIGHTS = {
  intensity: 30,
  body: 20,
  acidity: 15,
  notes: 20,
  category: 15,
} as const;

function proximity(value: number, target: number, weight: number, step: number): number {
  return Math.max(0, weight - step * Math.abs(value - target));
}

function intensityCriterion(product: Product, profile: TasteProfile): DiscoveryCriterion {
  const points = proximity(
    product.sensory.intensity,
    profile.intensity,
    WEIGHTS.intensity,
    7,
  );
  return {
    rule: "intensity",
    points,
    max: WEIGHTS.intensity,
    detail:
      product.sensory.intensity === profile.intensity
        ? `Intensidade ${product.sensory.intensity}, igual à que você pediu`
        : `Intensidade ${product.sensory.intensity} para um perfil ${profile.intensity}`,
  };
}

function bodyCriterion(product: Product, profile: TasteProfile): DiscoveryCriterion {
  const points = proximity(product.sensory.body, profile.body, WEIGHTS.body, 5);
  return {
    rule: "body",
    points,
    max: WEIGHTS.body,
    detail: `Corpo ${product.sensory.body} para um perfil ${profile.body}`,
  };
}

function acidityCriterion(product: Product, profile: TasteProfile): DiscoveryCriterion {
  const acidity = product.sensory.acidity;
  if (acidity === null) {
    return {
      rule: "acidity",
      points: 8,
      max: WEIGHTS.acidity,
      detail: "Acidez não cadastrada — critério neutro",
    };
  }
  const diff = Math.abs(acidity - profile.acidity);
  const points = diff <= 1 ? 15 : diff === 2 ? 8 : 0;
  return {
    rule: "acidity",
    points,
    max: WEIGHTS.acidity,
    detail: `Acidez ${acidity} para um perfil ${profile.acidity}`,
  };
}

function notesCriterion(product: Product, profile: TasteProfile): DiscoveryCriterion {
  const wanted = new Set(profile.notes);
  const common = product.sensory.notes.filter((note) => wanted.has(note));
  const points = Math.min(WEIGHTS.notes, common.length * 7);
  return {
    rule: "notes",
    points,
    max: WEIGHTS.notes,
    detail:
      common.length > 0
        ? `Notas que você pediu: ${common.slice(0, 3).join(", ")}`
        : "Sem notas em comum com sua seleção",
  };
}

function categoryCriterion(product: Product, profile: TasteProfile): DiscoveryCriterion {
  if (profile.categories.length === 0) {
    return {
      rule: "category",
      points: WEIGHTS.category,
      max: WEIGHTS.category,
      detail: "Você deixou as coleções em aberto",
    };
  }
  const matches = profile.categories.includes(product.type);
  return {
    rule: "category",
    points: matches ? WEIGHTS.category : 0,
    max: WEIGHTS.category,
    detail: matches ? "Está em uma coleção que você escolheu" : "Fora das coleções escolhidas",
  };
}

function buildReason(profile: TasteProfile, commonNotes: string[]): string {
  const parts: string[] = [];
  if (commonNotes.length > 0) {
    parts.push(`notas de ${commonNotes.slice(0, 2).join(" e ")}`);
  }
  parts.push(`intensidade e corpo próximos do que você busca (${profile.intensity}/${profile.body})`);
  return `Escolhido por ${parts.join(", ")}.`;
}

export class DiscoveryService {
  eligible(product: Product, profile: TasteProfile): boolean {
    if (!product.available) return false;
    if (
      profile.categories.length > 0 &&
      !profile.categories.includes(product.type)
    ) {
      return false;
    }
    if (profile.maxPriceCents !== null) {
      if (product.price === null) return false;
      if (product.price.cents > profile.maxPriceCents) return false;
    }
    return true;
  }

  score(product: Product, profile: TasteProfile): DiscoveryScore {
    const criteria: DiscoveryCriterion[] = [
      intensityCriterion(product, profile),
      bodyCriterion(product, profile),
      acidityCriterion(product, profile),
      notesCriterion(product, profile),
      categoryCriterion(product, profile),
    ];
    const total = criteria.reduce((sum, criterion) => sum + criterion.points, 0);

    const wanted = new Set(profile.notes);
    const commonNotes = product.sensory.notes.filter((note) => wanted.has(note));

    return DiscoveryScore.of(total, criteria, buildReason(profile, commonNotes));
  }

  rank(
    products: readonly Product[],
    profile: TasteProfile,
    limit: number,
  ): DiscoveryMatch[] {
    return products
      .filter((product) => this.eligible(product, profile))
      .map((product) => ({ product, score: this.score(product, profile) }))
      .sort((a, b) => b.score.value - a.score.value)
      .slice(0, Math.max(1, limit));
  }
}

export const discoveryService = new DiscoveryService();
