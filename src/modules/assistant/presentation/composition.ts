import { GroqLanguageModelProvider } from "@/infrastructure/ai/groq-provider";
import { getPrisma } from "@/infrastructure/database/prisma";
import { hasGroqKey } from "@/lib/env";
import { PrismaProductRepository } from "@/modules/catalog/infrastructure/prisma-product-repository";
import type { LanguageModelProvider } from "@/modules/assistant/application/language-model-provider";
import { AskVirtualBarista } from "@/modules/assistant/application/ask-virtual-barista";
import { PrismaPairingRepository } from "@/modules/pairing/infrastructure/prisma-pairing-repository";

export function assistantUseCases() {
  const prisma = getPrisma();
  const products = new PrismaProductRepository(prisma);
  const pairings = new PrismaPairingRepository(prisma);
  const provider: LanguageModelProvider | null = hasGroqKey()
    ? new GroqLanguageModelProvider()
    : null;
  return {
    askVirtualBarista: new AskVirtualBarista(products, pairings, provider),
  };
}
