import { getPrisma } from "@/infrastructure/database/prisma";
import { GetProductDetails } from "@/modules/catalog/application/get-product-details";
import { GetProductsByIds } from "@/modules/catalog/application/get-products-by-ids";
import { ListProducts } from "@/modules/catalog/application/list-products";
import {
  GetMedia,
  ManageProducts,
  RemoveProductImage,
  SetProductImage,
} from "@/modules/catalog/application/manage-products";
import { PrismaAdminProductRepository } from "@/modules/catalog/infrastructure/prisma-admin-product-repository";
import { PrismaMediaRepository } from "@/modules/catalog/infrastructure/prisma-media-repository";
import { PrismaProductRepository } from "@/modules/catalog/infrastructure/prisma-product-repository";

export function catalogUseCases() {
  const products = new PrismaProductRepository(getPrisma());
  return {
    listProducts: new ListProducts(products),
    getProductDetails: new GetProductDetails(products),
    getProductsByIds: new GetProductsByIds(products),
  };
}

export function catalogAdminUseCases() {
  const prisma = getPrisma();
  const products = new PrismaAdminProductRepository(prisma);
  const media = new PrismaMediaRepository(prisma);
  return {
    manageProducts: new ManageProducts(products),
    setProductImage: new SetProductImage(products, media),
    removeProductImage: new RemoveProductImage(media),
    getMedia: new GetMedia(media),
  };
}
