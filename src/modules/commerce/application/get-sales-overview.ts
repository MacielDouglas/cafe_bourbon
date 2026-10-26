import type { SalesOverview } from "@/modules/commerce/domain/order";
import {
  type OrderRepository,
} from "@/modules/commerce/domain/order-repository";

const RECENT_ORDERS = 8;
const LOW_STOCK_LIMIT = 6;

export class GetSalesOverview {
  constructor(private readonly orders: OrderRepository) {}

  async execute(): Promise<SalesOverview> {
    return this.orders.salesOverview(RECENT_ORDERS, LOW_STOCK_LIMIT);
  }
}
