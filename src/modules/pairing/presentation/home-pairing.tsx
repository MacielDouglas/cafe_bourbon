"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RotateCw } from "lucide-react";
import { DemoBadge } from "@/components/demo-badge";
import { Button } from "@/components/ui/button";
import type { ProductType } from "@/modules/catalog/domain/value-objects";
import { productTypeLabel } from "@/modules/catalog/presentation/labels";

export interface HomePairingProduct {
  name: string;
  slug: string;
  type: ProductType;
  isDemoData: boolean;
}

export interface HomePairingItem {
  id: string;
  score: number;
  explanation: string;
  imageUrl: string;
  products: HomePairingProduct[];
}

export function HomePairing({ items }: { items: HomePairingItem[] }) {
  const [index, setIndex] = useState(0);
  const item = items[index] ?? items[0];

  if (!item) return null;

  const names = item.products.map((product) => product.name).join(" + ");
  const hasDemo = item.products.some((product) => product.isDemoData);
  const canCycle = items.length > 1;

  return (
    <section
      aria-labelledby="mesa-hoje"
      className="border-y border-border bg-secondary/45"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-28">
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted shadow-soft ring-1 ring-foreground/5">
          <div key={item.id} className="home-pairing-in absolute inset-0">
            <Image
              src={item.imageUrl}
              alt={`Mesa com ${names}`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              unoptimized={item.imageUrl.startsWith("/api/media/")}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-espresso/90 via-espresso/15 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-creme">
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-medium tracking-[0.18em] uppercase opacity-80">
                  Sugestão da casa
                </p>
                <p className="mt-1 max-w-md text-xl leading-snug font-medium text-balance">
                  {names}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-creme/30 bg-espresso/60 px-3 py-1 text-sm tabular-nums">
                {item.score}
                <span className="text-creme/60">/100</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h2
            id="mesa-hoje"
            className="text-3xl font-medium tracking-tight sm:text-4xl"
          >
            A mesa de hoje
          </h2>

          <div aria-live="polite" className="flex flex-col gap-4">
            <div
              key={`copy-${item.id}`}
              className="home-pairing-in flex flex-col gap-4"
            >
              <p className="max-w-prose text-lg leading-relaxed text-foreground/80">
                {item.explanation}
              </p>
              <ul className="flex flex-wrap gap-2">
                {item.products.map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/produtos/${product.slug}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/60"
                    >
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {productTypeLabel[product.type]}
                      </span>
                      {product.isDemoData && <DemoBadge />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              {canCycle
                ? `Sugestão ${index + 1} de ${items.length} · heurística revisada pela curadoria.`
                : "Heurística revisada pela curadoria."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="/harmonizacoes"
              className="group inline-flex min-h-10 items-center gap-1.5 rounded-sm text-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              Ver todas as harmonizações
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            {canCycle && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setIndex((current) => (current + 1) % items.length)
                }
              >
                <RotateCw className="size-4" />
                Outra sugestão
              </Button>
            )}
          </div>

          {hasDemo && (
            <p className="text-xs text-muted-foreground">
              Queijos e vinhos desta sugestão são dados demonstrativos.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
