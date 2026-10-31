import { Suspense } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
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
    <div>
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:px-8 lg:py-20">
          <header className="flex max-w-2xl flex-col gap-4">
            <h1 className="text-5xl leading-[0.98] font-medium tracking-tight text-balance sm:text-6xl">
              Cafés, queijos e vinhos
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Perfis sensoriais de origem única, prontos para combinar à mesa.
              Filtre por coleção, ordene por preço e compare intensidade, corpo e
              acidez na própria ficha. Queijos e vinhos estão disponíveis para harmonização.
            </p>
          </header>

          <aside
            aria-labelledby="como-ler"
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <h2 id="como-ler" className="text-lg font-medium">
              Como ler a ficha
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Intensidade, corpo e acidez aparecem em cinco segmentos. Quanto
              mais preenchidos, mais presente o traço.
            </p>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">Delicado</span>
              <span className="flex items-center gap-1" aria-hidden>
                {[1, 2, 3, 4, 5].map((step) => (
                  <span
                    key={step}
                    className={`h-1.5 w-5 rounded-full ${
                      step <= 4 ? "bg-brand" : "bg-border"
                    }`}
                  />
                ))}
              </span>
              <span className="text-xs text-muted-foreground">Intenso</span>
            </div>
            <span className="sr-only">
              Escala ilustrativa de 1 a 5, em que 1 é delicado e 5 é intenso.
            </span>
            <Link
              href="/descobrir"
              className="group inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              Descobrir meu perfil
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
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
    </div>
  );
}
