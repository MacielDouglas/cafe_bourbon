import type { PrismaClient } from "@prisma/client";
import type { Pairing } from "@/modules/pairing/domain/pairing";
import type {
  PairingFilter,
  PairingRepository,
} from "@/modules/pairing/domain/repository";
import { toDomainPairing } from "@/modules/pairing/infrastructure/prisma-mapper";

export class PrismaPairingRepository implements PairingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listPublished(filter: PairingFilter): Promise<Pairing[]> {
    const limit = Math.min(Math.max(Math.trunc(filter.limit ?? 20), 1), 50);
    const records = await this.prisma.pairing.findMany({
      where: {
        published: true,
        ...(filter.productId ? { productIds: { has: filter.productId } } : {}),
      },
      orderBy: { score: "desc" },
      take: limit,
    });
    return records.map(toDomainPairing);
  }
}
