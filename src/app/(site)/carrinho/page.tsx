import { Suspense } from "react";
import { CartSection } from "@/modules/commerce/presentation/cart-section";
import { CartSkeleton } from "@/modules/commerce/presentation/skeletons";

export const metadata = {
  title: "Carrinho",
  description:
    "Revise os itens do seu carrinho. Preços sempre calculados no servidor.",
};

export default function CarrinhoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          Sua seleção
        </h1>
        <p className="text-muted-foreground">
          Preços e totais são calculados no servidor a cada atualização. Nesta
          versão o pedido é sem pagamento.
        </p>
      </header>

      <section className="mt-12">
        <Suspense fallback={<CartSkeleton />}>
          <CartSection />
        </Suspense>
      </section>
    </div>
  );
}
