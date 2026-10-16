import { StateLink, StateMessage } from "@/components/state-message";
import { loadEditorialPairings } from "@/modules/pairing/presentation/data";
import { PairingPanel } from "@/modules/pairing/presentation/pairing-panel";

export async function EditorialPairings() {
  const { pairings, failed } = await loadEditorialPairings();

  if (failed) {
    return (
      <StateMessage
        eyebrow="Escolhas da casa"
        title="Harmonizações temporariamente indisponíveis"
        description="Não conseguimos falar com o banco de dados agora. Tente novamente em instantes."
        action={<StateLink href="/harmonizacoes">Recarregar</StateLink>}
      />
    );
  }

  if (pairings.length === 0) {
    return (
      <StateMessage
        eyebrow="Escolhas da casa"
        title="Ainda não há curadoria publicada"
        description="Use o harmonizador acima enquanto preparamos novas combinações."
        action={<StateLink href="/produtos">Ver catálogo</StateLink>}
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {pairings.map(({ pairing, products }) => (
        <PairingPanel
          key={pairing.id}
          products={products}
          score={pairing.score}
          criteria={pairing.criteria}
          explanation={pairing.explanation}
          origin={pairing.origin}
          itemValue={pairing.id}
        />
      ))}
    </div>
  );
}
