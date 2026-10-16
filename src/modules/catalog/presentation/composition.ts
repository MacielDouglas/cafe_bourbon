import { getPrisma } from "@/infrastructure/database/prisma";
import { ListProducts } from "@/modules/catalog/application/list-products";
import { GetProductDetails } from "@/modules/catalog/application/get-product-details";
import { PrismaProductRepository } from "@/modules/catalog/infrastructure/prisma-product-repository";

export function catalogUseCases() {
  const products = new PrismaProductRepository(getPrisma());
  return {
    listProducts: new ListProducts(products),
    getProductDetails: new GetProductDetails(products),
  };
}
