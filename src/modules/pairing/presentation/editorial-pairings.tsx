import { cn } from "cn";
import { StateLink, StateMessage } from "@/components/state-message";
import { loadEditorialPairings } from "@/modules/pairing/presentation/data";
import { PairingPanel } from "@/modules/pairing/presentation/pairing-panel";

const cardDelay = [
  "catalog-delay-1",
  "catalog-delay-2",
  "catalog-delay-3",
  "catalog-delay-4",
  "catalog-delay-5",
  "catalog-delay-6",
] as const;

export async function EditorialPairings() {
  const { pairings, failed } = await loadEditorialPairings();

  if (failed) {
    return (
      <StateMessage
        title="Harmonizações temporariamente indisponíveis"
        description="Não conseguimos falar com o banco de dados agora. Tente novamente em instantes."
        action={<StateLink href="/harmonizacoes">Recarregar</StateLink>}
      />
    );
  }

  if (pairings.length === 0) {
    return (
      <StateMessage
        title="Ainda não há curadoria publicada"
        description="Use o harmonizador acima enquanto preparamos novas combinações."
        action={<StateLink href="/produtos">Ver catálogo</StateLink>}
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {pairings.map(({ pairing, products }, index) => (
        <div key={pairing.id} className={cn("catalog-in", cardDelay[index])}>
          <PairingPanel
            products={products}
            score={pairing.score}
            criteria={pairing.criteria}
            explanation={pairing.explanation}
            origin={pairing.origin}
            itemValue={pairing.id}
          />
        </div>
      ))}
    </div>
  );
}
