import { StateMessage, StateLink } from "@/components/state-message";

export default function ProdutoNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
      <StateMessage
        eyebrow="404"
        title="Produto não encontrado"
        description="O produto que você procura não existe ou saiu do catálogo."
        action={<StateLink href="/produtos">Ver todo o catálogo</StateLink>}
      />
    </div>
  );
}
