import { Suspense } from "react";
import { EditorialPairings } from "@/modules/pairing/presentation/editorial-pairings";
import { Harmonizer } from "@/modules/pairing/presentation/harmonizer";
import {
  HarmonizerSkeleton,
  PairingGridSkeleton,
} from "@/modules/pairing/presentation/pairing-skeleton";
import { parsePairingSearchParams } from "@/modules/pairing/presentation/search-params";

export const metadata = {
  title: "Harmonizações",
  description:
    "Combinações de cafés, queijos e vinhos com nota explicável — curadoria da casa e sugestões calculadas.",
};

export default async function HarmonizacoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parsePairingSearchParams(await searchParams);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="flex max-w-2xl flex-col gap-3">
        <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-brand uppercase">
          Harmonizações
        </span>
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          O que combina com o quê
        </h1>
        <p className="text-muted-foreground">
          Cruzamos intensidade, corpo, acidez e notas para sugerir pares de café,
          queijo e vinho. Cada nota é uma heurística do sistema, explicada
          critério a critério — não uma verdade científica.
        </p>
      </header>

      <section className="mt-12 flex flex-col gap-6">
        <h2 className="text-2xl font-medium tracking-tight">
          Monte sua harmonização
        </h2>
        <Suspense fallback={<HarmonizerSkeleton />}>
          <Harmonizer coffeeSlug={params.cafe} />
        </Suspense>
      </section>

      <section className="mt-16 flex flex-col gap-6">
        <h2 className="text-2xl font-medium tracking-tight">Escolhas da casa</h2>
        <Suspense fallback={<PairingGridSkeleton />}>
          <EditorialPairings />
        </Suspense>
      </section>
    </div>
  );
}
