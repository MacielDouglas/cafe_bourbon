import type { OrderSummary } from "@/modules/commerce/domain/order";
import type { OrderRepository } from "@/modules/commerce/domain/order-repository";

const DEFAULT_LIMIT = 50;

export class ListOrders {
  constructor(private readonly orders: OrderRepository) {}

  async execute(limit = DEFAULT_LIMIT): Promise<OrderSummary[]> {
    const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 200);
    return this.orders.listRecent(safeLimit);
  }
}
