import { getPrisma } from "@/infrastructure/database/prisma";
import { GetPairingRecommendations } from "@/modules/pairing/application/get-pairing-recommendations";
import { PrismaPairingRepository } from "@/modules/pairing/infrastructure/prisma-pairing-repository";

export function pairingUseCases() {
  const pairings = new PrismaPairingRepository(getPrisma());
  return {
    getPairingRecommendations: new GetPairingRecommendations(pairings),
  };
}
