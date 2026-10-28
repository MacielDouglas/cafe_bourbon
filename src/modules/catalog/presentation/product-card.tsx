import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { cn } from "cn";
import { DemoBadge } from "@/components/demo-badge";
import type { Product } from "@/modules/catalog/domain/product";
import { formatProductPrice } from "@/modules/catalog/presentation/format";
import {
  brewMethodLabel,
  productSubtitle,
  productTypeLabel,
} from "@/modules/catalog/presentation/labels";
import { SensoryProfile } from "@/modules/catalog/presentation/sensory-profile";

function ProductThumb({ product }: { product: Product }) {
  if (product.imageUrl) {
    return (
      <Image
        src={product.imageUrl}
        alt={product.name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        unoptimized={product.imageUrl.startsWith("/api/media/")}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="flex size-full items-center justify-center bg-secondary">
      <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
        {productTypeLabel[product.type]}
      </span>
    </div>
  );
}

export function ProductCard({
  product,
  className,
  compare,
}: {
  product: Product;
  className?: string;
  compare?: { selected: boolean; href: string | null };
}) {
  const price = formatProductPrice(product);

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      <Link
        href={`/produtos/${product.slug}`}
        className="group flex flex-1 flex-col gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted shadow-soft ring-1 ring-foreground/5 transition-shadow group-hover:shadow-lift">
          <ProductThumb product={product} />
          <div
            aria-hidden
            className="absolute inset-0 flex items-end justify-end bg-linear-to-t from-espresso/30 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-focus-visible:opacity-100 group-hover:opacity-100"
          >
            <span className="inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-creme/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft transition-transform duration-300 group-hover:translate-y-0">
              Ver ficha
              <ArrowUpRightIcon className="size-3.5" />
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium transition-colors group-hover:text-brand">
              {product.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {productSubtitle(product)}
            </span>
            {product.profile.kind === "COFFEE" && (
              <span className="text-[0.6875rem] text-muted-foreground">
                {product.profile.brewMethods
                  .slice(0, 3)
                  .map((method) => brewMethodLabel[method])
                  .join(" · ")}
              </span>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-border/70 pt-2">
            <SensoryProfile sensory={product.sensory} compact />
            <div className="flex items-center justify-between gap-2 text-sm">
              <span>{price ?? "Indisponível"}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {productTypeLabel[product.type]}
                {product.isDemoData && <DemoBadge />}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {compare &&
        (compare.href ? (
          <Link
            href={compare.href}
            className="w-fit rounded-sm text-xs font-medium text-muted-foreground underline-offset-4 outline-none hover:text-brand hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {compare.selected ? "Remover da comparação" : "Comparar"}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">
            Limite de 4 produtos
          </span>
        ))}
    </div>
  );
}
