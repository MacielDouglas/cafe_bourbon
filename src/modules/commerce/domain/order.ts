export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface OrderLine {
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
}

export interface OrderSummary {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: Date;
  items: OrderLine[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenueCents: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

export interface SalesOverview {
  totalRevenueCents: number;
  orderCount: number;
  averageTicketCents: number;
  totalItemsSold: number;
  topProducts: TopProduct[];
  lowStock: LowStockProduct[];
  recentOrders: OrderSummary[];
}

export interface CreateOrderData {
  userId: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  items: readonly OrderLine[];
}

export const LOW_STOCK_THRESHOLD = 5;
