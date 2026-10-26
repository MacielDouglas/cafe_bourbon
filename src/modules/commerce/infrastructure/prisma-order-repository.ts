import type { PrismaClient } from "@prisma/client";
import type {
  CreateOrderData,
  OrderSummary,
  SalesOverview,
  TopProduct,
} from "@/modules/commerce/domain/order";
import type { OrderRepository } from "@/modules/commerce/domain/order-repository";
import { DomainError } from "@/modules/shared/domain/errors";

type OrderRecord = {
  id: string;
  customerName: string;
  customerEmail: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  totalCents: number;
  createdAt: Date;
  items: {
    productId: string;
    productName: string;
    unitPriceCents: number;
    quantity: number;
    subtotalCents: number;
  }[];
};

function toOrderSummary(record: OrderRecord): OrderSummary {
  return {
    id: record.id,
    customerName: record.customerName,
    customerEmail: record.customerEmail,
    status: record.status,
    totalCents: record.totalCents,
    createdAt: record.createdAt,
    items: record.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      subtotalCents: item.subtotalCents,
    })),
  };
}

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateOrderData): Promise<OrderSummary> {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          for (const item of data.items) {
            const updated = await tx.product.updateMany({
              where: {
                id: item.productId,
                available: true,
                stock: { gte: item.quantity },
              },
              data: { stock: { decrement: item.quantity } },
            });
            if (updated.count === 0) {
              throw new DomainError(
                `Estoque insuficiente para ${item.productName}.`,
              );
            }
          }

          const order = await tx.order.create({
            data: {
              userId: data.userId,
              customerName: data.customerName,
              customerEmail: data.customerEmail,
              status: "CONFIRMED",
              totalCents: data.totalCents,
              items: {
                create: data.items.map((item) => ({
                  productId: item.productId,
                  productName: item.productName,
                  unitPriceCents: item.unitPriceCents,
                  quantity: item.quantity,
                  subtotalCents: item.subtotalCents,
                })),
              },
            },
            include: { items: true },
          });

          await tx.cartItem.deleteMany({ where: { userId: data.userId } });
          return toOrderSummary(order);
        },
        { maxWait: 15_000, timeout: 30_000 },
      );
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw new DomainError("Não foi possível concluir o pedido.");
    }
  }

  async listRecent(limit: number): Promise<OrderSummary[]> {
    const records = await this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return records.map(toOrderSummary);
  }

  async salesOverview(
    recentLimit: number,
    lowStockLimit: number,
  ): Promise<SalesOverview> {
    const where = { status: { not: "CANCELLED" as const } };

    const [aggregate, orderCount, itemRows, lowStockRows, recent] =
      await Promise.all([
        this.prisma.order.aggregate({
          where,
          _sum: { totalCents: true },
        }),
        this.prisma.order.count({ where }),
        this.prisma.orderItem.findMany({
          where: { order: { status: { not: "CANCELLED" } } },
          select: {
            productId: true,
            productName: true,
            quantity: true,
            subtotalCents: true,
          },
        }),
        this.prisma.product.findMany({
          where: { available: true, stock: { lte: 5 } },
          orderBy: { stock: "asc" },
          take: lowStockLimit,
          select: { id: true, name: true, stock: true },
        }),
        this.prisma.order.findMany({
          include: { items: true },
          orderBy: { createdAt: "desc" },
          take: recentLimit,
        }),
      ]);

    const byProduct = new Map<string, TopProduct>();
    for (const row of itemRows) {
      const current = byProduct.get(row.productId) ?? {
        productId: row.productId,
        productName: row.productName,
        quantity: 0,
        revenueCents: 0,
      };
      current.quantity += row.quantity;
      current.revenueCents += row.subtotalCents;
      byProduct.set(row.productId, current);
    }

    const topProducts = [...byProduct.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const totalRevenueCents = aggregate._sum.totalCents ?? 0;
    const totalItemsSold = itemRows.reduce((sum, row) => sum + row.quantity, 0);

    return {
      totalRevenueCents,
      orderCount,
      averageTicketCents:
        orderCount > 0 ? Math.round(totalRevenueCents / orderCount) : 0,
      totalItemsSold,
      topProducts,
      lowStock: lowStockRows,
      recentOrders: recent.map(toOrderSummary),
    };
  }
}
