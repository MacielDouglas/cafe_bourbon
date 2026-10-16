import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";
import type { Product } from "@/modules/catalog/domain/product";
import { formatProductPrice } from "@/modules/catalog/presentation/format";
import {
  productSubtitle,
  productTypeLabel,
} from "@/modules/catalog/presentation/labels";

function ProductThumb({ product }: { product: Product }) {
  if (product.imageUrl) {
    return (
      <Image
        src={product.imageUrl}
        alt={product.name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
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
}: {
  product: Product;
  className?: string;
}) {
  const price = formatProductPrice(product);

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className={cn("group flex flex-col gap-3", className)}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5">
        <ProductThumb product={product} />
        {product.isDemoData && (
          <span className="absolute top-3 left-3 rounded-full bg-background/85 px-2 py-0.5 text-[0.625rem] font-medium tracking-[0.12em] text-muted-foreground uppercase backdrop-blur">
            Demonstrativo
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          {productTypeLabel[product.type]}
        </span>
        <span className="font-medium transition-colors group-hover:text-brand">
          {product.name}
        </span>
        <span className="text-sm text-muted-foreground">
          {productSubtitle(product)}
        </span>
        <span className="mt-1 text-sm">
          {price ?? "Indisponível"}
        </span>
      </div>
    </Link>
  );
}
