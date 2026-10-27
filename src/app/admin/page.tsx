import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StateLink, StateMessage } from "@/components/state-message";
import { formatCents } from "@/modules/catalog/presentation/format";
import { loadSalesOverview } from "@/modules/admin/presentation/data";

export const instant = false;

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function AdminHomePage() {
  const { overview, failed } = await loadSalesOverview();

  if (failed || !overview) {
    return (
      <StateMessage
        title="Não conseguimos carregar as métricas"
        description="O banco de dados está indisponível no momento. Tente novamente em instantes."
        action={<StateLink href="/admin">Recarregar</StateLink>}
      />
    );
  }

  const stats = [
    { label: "Receita", value: formatCents(overview.totalRevenueCents) },
    { label: "Pedidos", value: String(overview.orderCount) },
    { label: "Ticket médio", value: formatCents(overview.averageTicketCents) },
    {
      label: "Itens vendidos",
      value: String(overview.totalItemsSold),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mais vendidos</CardTitle>
              <CardDescription>Ranking por quantidade vendida</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {overview.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma venda registrada ainda.
              </p>
            ) : (
              <ol className="flex flex-col divide-y divide-border">
                {overview.topProducts.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between gap-4 py-2 text-sm"
                  >
                    <span className="truncate">{item.productName}</span>
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {item.quantity} un · {formatCents(item.revenueCents)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estoque baixo</CardTitle>
            <CardDescription>Produtos disponíveis com 5 unidades ou menos</CardDescription>
          </CardHeader>
          <CardContent>
            {overview.lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum produto com estoque baixo.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {overview.lowStock.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-2 text-sm"
                  >
                    <span className="truncate">{item.name}</span>
                    <Badge variant={item.stock === 0 ? "destructive" : "outline"}>
                      {item.stock} un
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pedidos recentes</CardTitle>
            <CardDescription>Últimos pedidos demonstrativos</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/pedidos" />}
          >
            Ver todos
          </Button>
        </CardHeader>
        <CardContent>
          {overview.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum pedido registrado ainda.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {overview.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">
                      {order.customerName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dateFormat.format(order.createdAt)} ·{" "}
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      itens
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{order.status}</Badge>
                    <span className="font-medium tabular-nums">
                      {formatCents(order.totalCents)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
