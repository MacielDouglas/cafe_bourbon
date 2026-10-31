import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Product } from "@/modules/catalog/domain/product";
import { formatCents } from "@/modules/catalog/presentation/format";
import { productTypeLabel } from "@/modules/catalog/presentation/labels";
import {
  HARMONIZATION_KIT_DISCOUNT_PERCENT,
  computeHarmonizationDiscount,
} from "@/modules/shared/domain/harmonization-kit";
import { AddKitButton } from "@/modules/pairing/presentation/add-kit-button";
import type {
  PairingCriterion,
  PairingOrigin,
  PairingScore,
} from "@/modules/pairing/domain/pairing";
import {
  pairingOriginLabel,
  pairingRuleText,
} from "@/modules/pairing/presentation/labels";
import { PairingScoreBadge } from "@/modules/pairing/presentation/pairing-score";

function ProductChip({ product }: { product: Product }) {
  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="flex min-h-14 min-w-0 flex-1 flex-col justify-center gap-0.5 rounded-lg bg-secondary/70 px-3 py-2 outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <span className="truncate text-sm font-medium">{product.name}</span>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {productTypeLabel[product.type]}
        
      </span>
    </Link>
  );
}

function KitOffer({ products }: { products: Product[] }) {
  const discount = computeHarmonizationDiscount(
    products.map((product) => ({
      productId: product.id.value,
      type: product.type,
      priceCents: product.price?.cents ?? 0,
      quantity: 1,
    })),
  );
  const totalCents = products.reduce(
    (sum, product) => sum + (product.price?.cents ?? 0),
    0,
  );
  const kitCents = totalCents - discount.totalCents;
  const purchasable =
    products.length >= 2 && products.every((product) => product.purchasable);

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="text-sm font-medium">
            Kit de harmonização{" "}
            <span className="font-normal text-muted-foreground">
              · {HARMONIZATION_KIT_DISCOUNT_PERCENT}% off
            </span>
          </h3>
          <ul className="flex flex-col gap-0.5 text-sm text-muted-foreground">
            {products.map((product) => (
              <li
                key={product.id.value}
                className="flex items-baseline justify-between gap-4"
              >
                <span className="truncate">{product.name}</span>
                <span className="shrink-0 tabular-nums">
                  {product.price ? formatCents(product.price.cents) : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-end gap-0.5 text-right">
          <span className="text-[0.6875rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Preço do kit
          </span>
          <span className="text-2xl font-medium tabular-nums">
            {formatCents(kitCents)}
          </span>
          <span className="text-xs text-muted-foreground">
            Economize {formatCents(discount.totalCents)}
          </span>
        </div>
      </div>

      <AddKitButton
        productIds={products.map((product) => product.id.value)}
        kitName={products.map((product) => product.name).join(" + ")}
        disabled={!purchasable}
      />
    </div>
  );
}

function CriteriaList({ criteria }: { criteria: readonly PairingCriterion[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {criteria.map((criterion, index) => (
        <li
          key={`${criterion.rule}-${index}`}
          className="flex items-start justify-between gap-4"
        >
          <span className="text-foreground/80">
            <span className="font-medium">{pairingRuleText(criterion.rule)}</span>
            {" — "}
            {criterion.detail}
          </span>
          <span className="shrink-0 tabular-nums text-muted-foreground">
            {criterion.points}/{criterion.max}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ProductRow({ products }: { products: Product[] }) {
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {products.map((product, index) => (
        <div key={product.id.value} className="flex flex-1 items-center gap-2">
          {index > 0 && <span className="text-muted-foreground">+</span>}
          <ProductChip product={product} />
        </div>
      ))}
    </div>
  );
}

export function PairingPanel({
  products,
  score,
  criteria,
  explanation,
  origin,
  itemValue,
  footer,
}: {
  products: Product[];
  score: PairingScore;
  criteria: readonly PairingCriterion[];
  explanation: string;
  origin: PairingOrigin;
  itemValue: string;
  footer?: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h3 className="sr-only">
        Harmonização entre {products.map((product) => product.name).join(" e ")}
      </h3>
      <header className="flex items-start justify-between gap-4">
        <PairingScoreBadge value={score.value} tier={score.tier} />
        <Badge variant="outline" className="text-muted-foreground">
          {pairingOriginLabel[origin]}
        </Badge>
      </header>

      <ProductRow products={products} />

      <KitOffer products={products} />

      <p className="text-sm leading-relaxed text-foreground/80">{explanation}</p>

      <Accordion>
        <AccordionItem value={itemValue}>
          <AccordionTrigger>Como chegamos a esta nota</AccordionTrigger>
          <AccordionContent>
            <CriteriaList criteria={criteria} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {footer}
    </article>
  );
}
