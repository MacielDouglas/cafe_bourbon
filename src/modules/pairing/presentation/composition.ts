import { getPrisma } from "@/infrastructure/database/prisma";
import { PrismaProductRepository } from "@/modules/catalog/infrastructure/prisma-product-repository";
import { GetCalculatedPairings } from "@/modules/pairing/application/get-calculated-pairings";
import { GetPairingRecommendations } from "@/modules/pairing/application/get-pairing-recommendations";
import { pairingService } from "@/modules/pairing/domain/pairing-service";
import { PrismaPairingRepository } from "@/modules/pairing/infrastructure/prisma-pairing-repository";

export function pairingUseCases() {
  const prisma = getPrisma();
  const pairings = new PrismaPairingRepository(prisma);
  const products = new PrismaProductRepository(prisma);
  return {
    getPairingRecommendations: new GetPairingRecommendations(pairings),
    getCalculatedPairings: new GetCalculatedPairings(products, pairingService),
  };
}
