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
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="flex max-w-2xl flex-col gap-3">
        <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-brand uppercase">
          Assinatura
        </span>
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          Café bom, sem pensar
        </h1>
        <p className="text-muted-foreground">
          Receba cafés de origem única em casa, escolhendo moagem e método de
          preparo. Alterne entre planos quando quiser — esta é uma assinatura
          demonstrativa, sem cobrança.
        </p>
      </header>

      <section className="mt-12">
        <Suspense fallback={<SubscriptionSkeleton />}>
          <SubscriptionSection />
        </Suspense>
      </section>
    </div>
  );
}
