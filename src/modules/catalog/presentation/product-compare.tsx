import Link from "next/link";
import { DemoBadge } from "@/components/demo-badge";
import type { Product } from "@/modules/catalog/domain/product";
import { formatProductPrice } from "@/modules/catalog/presentation/format";
import {
  brewMethodLabel,
  productSpecs,
  productSubtitle,
  productTypeLabel,
} from "@/modules/catalog/presentation/labels";
import {
  SensoryNotes,
  SensoryProfile,
} from "@/modules/catalog/presentation/sensory-profile";

export function ProductCompare({
  products,
  clearHref,
}: {
  products: Product[];
  clearHref: string;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">
            Comparando {products.length} produtos
          </h2>
          <p className="text-sm text-muted-foreground">
            Perfil sensorial lado a lado. As barras usam a mesma escala de 1 a 5.
          </p>
        </div>
        <Link
          href={clearHref}
          className="rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          Limpar comparação
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => {
          const price = formatProductPrice(product);
          const specs = productSpecs(product);
          const methods =
            product.profile.kind === "COFFEE"
              ? product.profile.brewMethods
              : [];
          return (
            <article
              key={product.id.value}
              className="flex min-w-56 flex-1 flex-col gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div className="flex flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {product.name}
                  {product.isDemoData && <DemoBadge />}
                </span>
                <span className="text-xs text-muted-foreground">
                  {productTypeLabel[product.type]} · {productSubtitle(product)}
                </span>
                <span className="text-sm">
                  {price ?? "Indisponível"}
                </span>
              </div>

              <Link
                href={`/produtos/${product.slug}`}
                className="w-fit rounded-sm text-xs font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                Ver produto
              </Link>

              <SensoryProfile sensory={product.sensory} compact />
              <SensoryNotes notes={product.sensory.notes} />

              <dl className="flex flex-col gap-1.5 border-t border-border pt-3 text-xs">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{spec.label}</dt>
                    <dd className="text-right">{spec.value}</dd>
                  </div>
                ))}
                {methods.length > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Métodos</dt>
                    <dd className="text-right">
                      {methods.map((method) => brewMethodLabel[method]).join(", ")}
                    </dd>
                  </div>
                )}
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
