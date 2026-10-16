import type { Pairing } from "@/modules/pairing/domain/pairing";
import type { PairingRepository } from "@/modules/pairing/domain/repository";

export interface GetPairingRecommendationsInput {
  productId?: string;
  limit?: number;
}

export class GetPairingRecommendations {
  constructor(private readonly pairings: PairingRepository) {}

  async execute(
    input: GetPairingRecommendationsInput = {},
  ): Promise<Pairing[]> {
    return this.pairings.listPublished({
      ...(input.productId ? { productId: input.productId } : {}),
      ...(input.limit ? { limit: input.limit } : {}),
    });
  }
}
