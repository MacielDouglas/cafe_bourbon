import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StateLink, StateMessage } from "@/components/state-message";
import { formatCents } from "@/modules/catalog/presentation/format";
import { loadOrders } from "@/modules/admin/presentation/data";
import { OrderFilters } from "@/modules/admin/presentation/order-filters";

export const instant = false;

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const statusLabel: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const term = typeof raw.q === "string" ? raw.q.trim().toLowerCase() : "";
  const status =
    typeof raw.status === "string" &&
    ["PENDING", "CONFIRMED", "CANCELLED"].includes(raw.status)
      ? raw.status
      : "ALL";

  const { orders, failed } = await loadOrders();

  if (failed) {
    return (
      <StateMessage
        title="Não conseguimos carregar os pedidos"
        description="O banco de dados está indisponível no momento. Tente novamente em instantes."
        action={<StateLink href="/admin/pedidos">Recarregar</StateLink>}
      />
    );
  }

  const filtered = orders.filter((order) => {
    const matchesStatus = status === "ALL" || order.status === status;
    const matchesTerm =
      !term ||
      order.customerName.toLowerCase().includes(term) ||
      order.customerEmail.toLowerCase().includes(term);
    return matchesStatus && matchesTerm;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos</CardTitle>
        <CardDescription>
          {filtered.length} de {orders.length} pedido(s) mais recentes.
        </CardDescription>
        <OrderFilters search={term} status={status} />
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {orders.length === 0
              ? "Nenhum pedido registrado ainda. Finalize um carrinho para gerar o primeiro pedido."
              : "Nenhum pedido corresponde a esse filtro. Ajuste a busca ou o status."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-4 font-medium">Cliente</th>
                  <th className="py-2 pr-4 font-medium">Data</th>
                  <th className="py-2 pr-4 font-medium">Itens</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((order) => (
                  <tr key={order.id} className="align-top">
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">
                          {order.customerEmail}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {dateFormat.format(order.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        {order.items.map((item) => (
                          <li key={item.productId}>
                            {item.quantity}× {item.productName}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          order.status === "CANCELLED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {statusLabel[order.status] ?? order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-medium tabular-nums">
                      {formatCents(order.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
