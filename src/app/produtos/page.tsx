import { Suspense } from "react";
import { CatalogFilters } from "@/modules/catalog/presentation/catalog-filters";
import { CatalogResults } from "@/modules/catalog/presentation/catalog-results";
import { CatalogGridSkeleton } from "@/modules/catalog/presentation/catalog-skeleton";
import { parseCatalogSearchParams } from "@/modules/catalog/presentation/search-params";

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
        <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-brand uppercase">
          Catálogo
        </span>
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          Cafés, queijos e vinhos
        </h1>
        <p className="text-muted-foreground">
          Perfis sensoriais de origem única, prontos para combinar à mesa. Filtre
          por coleção ou busque pelo nome e pelas notas.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-8">
        <CatalogFilters active={params.tipo} search={params.busca} />
        <Suspense fallback={<CatalogGridSkeleton />}>
          <CatalogResults params={params} />
        </Suspense>
      </div>
    </div>
  );
}
