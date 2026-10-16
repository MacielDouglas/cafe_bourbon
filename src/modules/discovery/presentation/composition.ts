import { getPrisma } from "@/infrastructure/database/prisma";
import { PrismaProductRepository } from "@/modules/catalog/infrastructure/prisma-product-repository";
import { RecommendProductsFromPreferences } from "@/modules/discovery/application/recommend-products-from-preferences";
import { discoveryService } from "@/modules/discovery/domain/discovery-service";

export function discoveryUseCases() {
  const products = new PrismaProductRepository(getPrisma());
  return {
    recommendProductsFromPreferences: new RecommendProductsFromPreferences(
      products,
      discoveryService,
    ),
  };
}
