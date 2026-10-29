import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { cn } from "cn";
import { StateLink, StateMessage } from "@/components/state-message";
import { productSubtitle } from "@/modules/catalog/presentation/labels";
import { CoffeeSelect } from "@/modules/pairing/presentation/coffee-select";
import { loadHarmonizer } from "@/modules/pairing/presentation/data";
import { PairingPanel } from "@/modules/pairing/presentation/pairing-panel";

const cardDelay = [
  "catalog-delay-1",
  "catalog-delay-2",
  "catalog-delay-3",
  "catalog-delay-4",
  "catalog-delay-5",
  "catalog-delay-6",
] as const;

export async function Harmonizer({ coffeeSlug }: { coffeeSlug?: string }) {
  const { coffees, base, results, failed } = await loadHarmonizer(coffeeSlug);

  if (failed) {
    return (
      <StateMessage
        title="Não conseguimos calcular agora"
        description="O banco de dados está indisponível no momento. Tente novamente em instantes."
        action={<StateLink href="/harmonizacoes">Recarregar</StateLink>}
      />
    );
  }

  if (coffees.length === 0) {
    return (
      <StateMessage
        title="Nenhum café disponível"
        description="Assim que houver cafés disponíveis no catálogo, o harmonizador volta a funcionar."
        action={<StateLink href="/produtos">Ver catálogo</StateLink>}
      />
    );
  }

  const sensory = base?.sensory ?? null;
  const axes = sensory
    ? [
        { label: "Intensidade", value: sensory.intensity },
        { label: "Corpo", value: sensory.body },
        ...(sensory.acidity !== null
          ? [{ label: "Acidez", value: sensory.acidity }]
          : []),
      ]
    : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start">
      <aside className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft lg:sticky lg:top-24">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Escolha o café</span>
          <CoffeeSelect coffees={coffees} value={base?.slug} />
        </div>

        {base ? (
          <div className="flex flex-col gap-5 border-t border-border pt-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="leading-snug font-medium">{base.name}</h3>
                <Link
                  href={`/produtos/${base.slug}`}
                  aria-label={`Ver ficha de ${base.name}`}
                  className="rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <ArrowUpRightIcon className="size-4" />
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                {productSubtitle(base)}
              </p>
            </div>

            <dl className="flex flex-col gap-3">
              {axes.map((axis) => (
                <div key={axis.label} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <dt className="text-muted-foreground">{axis.label}</dt>
                    <dd className="tabular-nums text-foreground/75">
                      {axis.value}/5
                    </dd>
                  </div>
                  <div className="grid grid-cols-5 gap-1" aria-hidden>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className={cn(
                          "h-1 rounded-full",
                          index < axis.value ? "bg-brand" : "bg-border",
                        )}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </dl>

            {sensory && sensory.notes.length > 0 && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="text-foreground/70">Notas:</span>{" "}
                {sensory.notes.join(" · ")}
              </p>
            )}
          </div>
        ) : (
          <p className="border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
            Escolha um café para ver o perfil sensorial e os pares sugeridos.
          </p>
        )}
      </aside>

      {base ? (
        results.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
              <p className="text-lg font-medium">Pares para {base.name}</p>
              <p className="text-xs text-muted-foreground">
                {results.length === 1
                  ? "1 sugestão calculada"
                  : `${results.length} sugestões calculadas`}
              </p>
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              {results.map(({ product, calculation }, index) => (
                <div
                  key={product.id.value}
                  className={cn("catalog-in", cardDelay[index])}
                >
                  <PairingPanel
                    products={[base, product]}
                    score={calculation.score}
                    criteria={calculation.criteria}
                    explanation={calculation.explanation}
                    origin="CALCULATED"
                    itemValue={`calc-${product.id.value}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <StateMessage
            title="Não encontramos par para este café"
            description="Tente outro café ou explore as escolhas da casa logo abaixo."
          />
        )
      ) : (
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl bg-linho px-6 py-14 text-center">
          <p className="max-w-md text-2xl font-medium tracking-tight text-balance sm:text-3xl">
            A mesa começa pelo café.
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Escolha um café ao lado para ver queijos e vinhos que conversam com
            o perfil sensorial dele.
          </p>
          <p className="flex items-center gap-2 text-sm text-foreground/60">
            <span>Café</span>
            <span className="text-brand">+</span>
            <span>Queijo</span>
            <span className="text-brand">+</span>
            <span>Vinho</span>
          </p>
        </div>
      )}
    </div>
  );
}
