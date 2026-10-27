import { StateLink, StateMessage } from "@/components/state-message";
import { loadProducts } from "@/modules/catalog/presentation/data";
import { ProductCard } from "@/modules/catalog/presentation/product-card";
import type { CatalogSearchParams } from "@/modules/catalog/presentation/search-params";

export async function CatalogResults({ params }: { params: CatalogSearchParams }) {
  const { products, total, failed } = await loadProducts({
    ...(params.tipo ? { type: params.tipo } : {}),
    ...(params.busca ? { search: params.busca } : {}),
    page: params.pagina ?? 1,
    pageSize: 24,
  });

  if (failed) {
    return (
      <StateMessage
        title="Catálogo temporariamente indisponível"
        description="Não conseguimos falar com o banco de dados agora. Tente novamente em instantes."
        action={<StateLink href="/produtos">Recarregar</StateLink>}
      />
    );
  }

  if (products.length === 0) {
    return (
      <StateMessage
        title="Nada por aqui ainda"
        description={
          params.busca
            ? `Não encontramos produtos para “${params.busca}”. Tente outro termo ou explore as coleções.`
            : "Ainda não há produtos nesta coleção. Explore o catálogo completo."
        }
        action={<StateLink href="/produtos">Ver todos os produtos</StateLink>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "produto" : "produtos"}
      </p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id.value} product={product} />
        ))}
      </div>
    </div>
  );
}
