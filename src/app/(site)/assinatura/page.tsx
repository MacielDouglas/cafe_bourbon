import { Suspense } from "react";
import { SubscriptionSection } from "@/modules/commerce/presentation/subscription-section";
import { SubscriptionSkeleton } from "@/modules/commerce/presentation/skeletons";

export const metadata = {
  title: "Assinatura",
  description:
    "Planos Mensal, Coffee Lovers e Trimestral: café de origem única recorrente com escolha de moagem e preparo.",
};

export default function AssinaturaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="overflow-hidden rounded-3xl bg-linho px-6 py-10 sm:px-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div className="home-hero-focus flex flex-col gap-4">
            <h1 className="text-5xl font-medium tracking-tight text-balance sm:text-6xl">
              Café bom, sem pensar
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Receba cafés de origem única em casa, escolhendo moagem e método
              de preparo. Alterne entre planos quando quiser — esta é uma
              assinatura demonstrativa, sem cobrança.
            </p>
          </div>
          <p className="border-t border-foreground/10 pt-5 text-lg leading-snug font-medium lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            Três planos. Um café por vez, do jeito que você prepara.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 border-t border-foreground/10 pt-6 sm:grid-cols-3">
          <li className="flex gap-3">
            <span className="text-xl font-medium tabular-nums text-brand">
              01
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="font-medium">Escolha o plano</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Mensal, Coffee Lovers ou Trimestral.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-xl font-medium tabular-nums text-brand">
              02
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="font-medium">Escolha o café</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Uma origem única do catálogo atual.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-xl font-medium tabular-nums text-brand">
              03
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="font-medium">Receba em casa</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Em grãos ou moído para o seu método.
              </p>
            </div>
          </li>
        </ol>
      </header>

      <section className="mt-12">
        <Suspense fallback={<SubscriptionSkeleton />}>
          <SubscriptionSection />
        </Suspense>
      </section>
    </div>
  );
}
