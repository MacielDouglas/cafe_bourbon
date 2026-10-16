import { getPrisma } from "@/infrastructure/database/prisma";
import { GetProductDetails } from "@/modules/catalog/application/get-product-details";
import { GetProductsByIds } from "@/modules/catalog/application/get-products-by-ids";
import { ListProducts } from "@/modules/catalog/application/list-products";
import { PrismaProductRepository } from "@/modules/catalog/infrastructure/prisma-product-repository";

export function catalogUseCases() {
  const products = new PrismaProductRepository(getPrisma());
  return {
    listProducts: new ListProducts(products),
    getProductDetails: new GetProductDetails(products),
    getProductsByIds: new GetProductsByIds(products),
  };
}
