import { Suspense } from "react";
import { CatalogFilters } from "@/modules/catalog/presentation/catalog-filters";
import { CatalogResults } from "@/modules/catalog/presentation/catalog-results";
import { CatalogSort } from "@/modules/catalog/presentation/catalog-sort";
import { CatalogGridSkeleton } from "@/modules/catalog/presentation/catalog-skeleton";
import { parseCatalogSearchParams } from "@/modules/catalog/presentation/search-params";

export const instant = false;

export const metadata = {
  title: "Catálogo",
  description:
    "Explore cafés especiais de origem, queijos e vinhos selecionados para harmonizar.",
};

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseCatalogSearchParams(await searchParams);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          Cafés, queijos e vinhos
        </h1>
        <p className="text-muted-foreground">
          Perfis sensoriais de origem única, prontos para combinar à mesa. Filtre
          por coleção, ordene por preço e compare intensidade, corpo e acidez na
          própria ficha. Queijos e vinhos são dados demonstrativos.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CatalogFilters
            active={params.tipo}
            search={params.busca}
            sort={params.ordem}
            compare={params.comparar}
          />
          <CatalogSort
            active={params.tipo}
            search={params.busca}
            sort={params.ordem}
            compare={params.comparar}
          />
        </div>
        <Suspense fallback={<CatalogGridSkeleton />}>
          <CatalogResults params={params} />
        </Suspense>
      </div>
    </div>
  );
}
