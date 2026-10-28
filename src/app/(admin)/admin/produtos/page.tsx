import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StateLink, StateMessage } from "@/components/state-message";
import { AdminProductTable } from "@/modules/admin/presentation/admin-product-table";
import { loadAdminProducts } from "@/modules/admin/presentation/data";

export const instant = false;

export default async function AdminProductsPage() {
  const { products, failed } = await loadAdminProducts();

  if (failed) {
    return (
      <StateMessage
        title="Não conseguimos carregar os produtos"
        description="O banco de dados está indisponível no momento. Tente novamente em instantes."
        action={<StateLink href="/admin/produtos">Recarregar</StateLink>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium">Produtos</h2>
          <p className="text-sm text-muted-foreground">
            {products.length} item(ns) no catálogo, incluindo indisponíveis.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/produtos/novo" />}>
          Novo produto
        </Button>
      </div>

      <AdminProductTable products={products} />
    </div>
  );
}
