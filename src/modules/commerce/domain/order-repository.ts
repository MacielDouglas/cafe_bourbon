import type {
  CreateOrderData,
  OrderSummary,
  SalesOverview,
} from "@/modules/commerce/domain/order";

export interface OrderRepository {
  /** Cria o pedido, baixa estoque e limpa o carrinho de forma atômica. */
  create(data: CreateOrderData): Promise<OrderSummary>;
  listRecent(limit: number): Promise<OrderSummary[]>;
  salesOverview(recentLimit: number, lowStockLimit: number): Promise<SalesOverview>;
}
