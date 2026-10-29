import { Suspense } from "react";
import { EditorialPairings } from "@/modules/pairing/presentation/editorial-pairings";
import { Harmonizer } from "@/modules/pairing/presentation/harmonizer";
import {
  HarmonizerSkeleton,
  PairingGridSkeleton,
} from "@/modules/pairing/presentation/pairing-skeleton";
import { parsePairingSearchParams } from "@/modules/pairing/presentation/search-params";

export const instant = false;

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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="home-hero-focus overflow-hidden rounded-3xl bg-espresso px-6 py-10 text-creme sm:px-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-4xl font-medium tracking-tight text-balance sm:text-6xl">
              O que combina com o quê
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-creme/70 sm:text-base">
              Cruzamos intensidade, corpo, acidez e notas para sugerir pares de
              café, queijo e vinho. Cada nota é uma heurística do sistema,
              explicada critério a critério — não uma verdade científica.
            </p>
          </div>
          <div className="border-t border-creme/15 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <p className="text-xl leading-snug font-medium sm:text-2xl">
              Café <span className="text-creme/40">+</span> Queijo{" "}
              <span className="text-creme/40">+</span> Vinho
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-creme/60">
              A mesa começa pelo café. O resto é consequência do que a xícara
              pede.
            </p>
          </div>
        </div>
      </header>

      <section className="mt-14 flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Monte sua harmonização
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Escolha um café da casa e veja queijos e vinhos que conversam com o
            perfil sensorial dele.
          </p>
        </div>
        <Suspense fallback={<HarmonizerSkeleton />}>
          <Harmonizer coffeeSlug={params.cafe} />
        </Suspense>
      </section>

      <section className="mt-20 flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Escolhas da casa
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Combinações publicadas pela curadoria, com a nota e os critérios
            abertos para você discordar com fundamento.
          </p>
        </div>
        <Suspense fallback={<PairingGridSkeleton />}>
          <EditorialPairings />
        </Suspense>
      </section>
    </div>
  );
}
