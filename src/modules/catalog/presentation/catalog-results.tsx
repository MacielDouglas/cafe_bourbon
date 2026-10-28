import Link from "next/link";
import { cn } from "cn";
import { StateLink, StateMessage } from "@/components/state-message";
import {
  loadProducts,
  loadProductsBySlugs,
} from "@/modules/catalog/presentation/data";
import { ProductCard } from "@/modules/catalog/presentation/product-card";
import { ProductCompare } from "@/modules/catalog/presentation/product-compare";
import type { CatalogSearchParams } from "@/modules/catalog/presentation/search-params";

const PAGE_SIZE = 24;
const MAX_COMPARE = 4;

function baseSearch(params: CatalogSearchParams): URLSearchParams {
  const search = new URLSearchParams();
  if (params.tipo) search.set("tipo", params.tipo);
  if (params.busca) search.set("busca", params.busca);
  if (params.ordem) search.set("ordem", params.ordem);
  if (params.comparar) search.set("comparar", params.comparar);
  return search;
}

function pageHref(params: CatalogSearchParams, page: number): string {
  const search = baseSearch(params);
  if (page > 1) search.set("pagina", String(page));
  const query = search.toString();
  return query ? `/produtos?${query}` : "/produtos";
}

function compareHref(
  params: CatalogSearchParams,
  slug: string,
  selected: readonly string[],
): string | null {
  const next = new Set(selected);
  if (next.has(slug)) {
    next.delete(slug);
  } else if (next.size < MAX_COMPARE) {
    next.add(slug);
  } else {
    return null;
  }
  const search = baseSearch(params);
  if (next.size > 0) {
    search.set("comparar", [...next].join(","));
  } else {
    search.delete("comparar");
  }
  const query = search.toString();
  return query ? `/produtos?${query}` : "/produtos";
}

const paginationLink =
  "inline-flex min-h-10 items-center rounded-full border border-border px-5 text-sm outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const paginationDisabled =
  "pointer-events-none opacity-40";

export async function CatalogResults({ params }: { params: CatalogSearchParams }) {
  const page = params.pagina ?? 1;
  const selected = [
    ...new Set(
      (params.comparar ?? "")
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_COMPARE);

  const [{ products, total, failed }, compareProducts] = await Promise.all([
    loadProducts({
      ...(params.tipo ? { type: params.tipo } : {}),
      ...(params.busca ? { search: params.busca } : {}),
      ...(params.ordem ? { sort: params.ordem } : {}),
      page,
      pageSize: PAGE_SIZE,
    }),
    selected.length >= 2
      ? loadProductsBySlugs(selected)
      : Promise.resolve([]),
  ]);

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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const clearSearch = baseSearch({ ...params, comparar: undefined }).toString();

  return (
    <div className="flex flex-col gap-6">
      {compareProducts.length >= 2 && (
        <ProductCompare
          products={compareProducts}
          clearHref={clearSearch ? `/produtos?${clearSearch}` : "/produtos"}
        />
      )}

      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "produto" : "produtos"}
        {totalPages > 1 ? ` · página ${page} de ${totalPages}` : ""}
        {selected.length > 0
          ? ` · ${selected.length} selecionado(s) para comparar`
          : ""}
      </p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id.value}
            product={product}
            compare={{
              selected: selected.includes(product.slug),
              href: compareHref(params, product.slug, selected),
            }}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Paginação do catálogo"
          className="flex flex-wrap items-center justify-center gap-3 border-t border-border pt-6"
        >
          {page > 1 ? (
            <Link href={pageHref(params, page - 1)} className={paginationLink}>
              Anterior
            </Link>
          ) : (
            <span aria-disabled className={cn(paginationLink, paginationDisabled)}>
              Anterior
            </span>
          )}
          <span className="text-sm text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(params, page + 1)} className={paginationLink}>
              Próxima
            </Link>
          ) : (
            <span aria-disabled className={cn(paginationLink, paginationDisabled)}>
              Próxima
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
