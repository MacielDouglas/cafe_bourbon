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
import { productTypeLabel } from "@/modules/catalog/presentation/labels";
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
      className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border border-border px-3 py-2 transition-colors hover:border-foreground/30"
    >
      <span className="text-[0.625rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {productTypeLabel[product.type]}
      </span>
      <span className="truncate text-sm font-medium">{product.name}</span>
    </Link>
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
    <article className="flex flex-col gap-5 rounded-xl border border-border p-5">
      <header className="flex items-start justify-between gap-4">
        <PairingScoreBadge value={score.value} tier={score.tier} />
        <Badge variant="outline" className="text-muted-foreground">
          {pairingOriginLabel[origin]}
        </Badge>
      </header>

      <ProductRow products={products} />

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
