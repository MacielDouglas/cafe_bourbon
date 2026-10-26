import { getPrisma } from "@/infrastructure/database/prisma";
import { PrismaProductRepository } from "@/modules/catalog/infrastructure/prisma-product-repository";
import { CreateOrder } from "@/modules/commerce/application/create-order";
import { CreateSubscription } from "@/modules/commerce/application/create-subscription";
import { GetCart } from "@/modules/commerce/application/get-cart";
import { GetSalesOverview } from "@/modules/commerce/application/get-sales-overview";
import { ListOrders } from "@/modules/commerce/application/list-orders";
import { ListSubscriptionPlans } from "@/modules/commerce/application/list-subscription-plans";
import { ManageCart } from "@/modules/commerce/application/manage-cart";
import { PrismaCartRepository } from "@/modules/commerce/infrastructure/prisma-cart-repository";
import { PrismaOrderRepository } from "@/modules/commerce/infrastructure/prisma-order-repository";
import { PrismaSubscriptionRepository } from "@/modules/commerce/infrastructure/prisma-subscription-repository";

export function commerceUseCases() {
  const prisma = getPrisma();
  const products = new PrismaProductRepository(prisma);
  const carts = new PrismaCartRepository(prisma);
  const subscriptions = new PrismaSubscriptionRepository(prisma);
  const orders = new PrismaOrderRepository(prisma);

  return {
    getCart: new GetCart(carts, products),
    manageCart: new ManageCart(carts, products),
    listSubscriptionPlans: new ListSubscriptionPlans(),
    createSubscription: new CreateSubscription(subscriptions, products),
    createOrder: new CreateOrder(orders, products, carts),
    getSalesOverview: new GetSalesOverview(orders),
    listOrders: new ListOrders(orders),
  };
}
