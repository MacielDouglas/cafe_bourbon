import { StateLink, StateMessage } from "@/components/state-message";
import { CoffeeSelect } from "@/modules/pairing/presentation/coffee-select";
import { loadHarmonizer } from "@/modules/pairing/presentation/data";
import { PairingPanel } from "@/modules/pairing/presentation/pairing-panel";

export async function Harmonizer({ coffeeSlug }: { coffeeSlug?: string }) {
  const { coffees, base, results, failed } = await loadHarmonizer(coffeeSlug);

  if (failed) {
    return (
      <StateMessage
        eyebrow="Harmonizador"
        title="Não conseguimos calcular agora"
        description="O banco de dados está indisponível no momento. Tente novamente em instantes."
        action={<StateLink href="/harmonizacoes">Recarregar</StateLink>}
      />
    );
  }

  if (coffees.length === 0) {
    return (
      <StateMessage
        eyebrow="Harmonizador"
        title="Nenhum café disponível"
        description="Assim que houver cafés disponíveis no catálogo, o harmonizador volta a funcionar."
        action={<StateLink href="/produtos">Ver catálogo</StateLink>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Escolha o café
          </span>
          <CoffeeSelect coffees={coffees} value={base?.slug} />
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Comparamos intensidade, corpo, acidez e notas para sugerir queijos e
          vinhos à mesa. A nota é uma heurística do sistema.
        </p>
      </div>

      {base ? (
        results.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {results.map(({ product, calculation }) => (
              <PairingPanel
                key={product.id.value}
                products={[base, product]}
                score={calculation.score}
                criteria={calculation.criteria}
                explanation={calculation.explanation}
                origin="CALCULATED"
                itemValue={`calc-${product.id.value}`}
              />
            ))}
          </div>
        ) : (
          <StateMessage
            eyebrow="Sem combinações"
            title="Não encontramos par para este café"
            description="Tente outro café ou explore as escolhas da casa logo abaixo."
          />
        )
      ) : (
        <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          Selecione um café para ver as harmonizações sugeridas com queijos e
          vinhos.
        </p>
      )}
    </div>
  );
}
