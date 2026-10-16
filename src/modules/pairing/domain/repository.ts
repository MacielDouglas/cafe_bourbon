import type { Pairing } from "@/modules/pairing/domain/pairing";

export interface PairingFilter {
  productId?: string;
  limit?: number;
}

export interface PairingRepository {
  listPublished(filter: PairingFilter): Promise<Pairing[]>;
}
