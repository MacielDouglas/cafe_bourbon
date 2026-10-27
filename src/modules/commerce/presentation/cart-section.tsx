import { connection } from "next/server";
import { StateLink, StateMessage } from "@/components/state-message";
import type { SerializedCart } from "@/modules/commerce/presentation/serialize";
import { commerceUseCases } from "@/modules/commerce/presentation/composition";
import {
  currentUserId,
  readCartIdentity,
} from "@/modules/commerce/presentation/identity";
import { serializeCart } from "@/modules/commerce/presentation/serialize";
import { CartView } from "@/modules/commerce/presentation/cart-view";

export async function CartSection() {
  await connection();
  const { getCart } = commerceUseCases();

  let cart: SerializedCart | null = null;
  try {
    cart = serializeCart(await getCart.execute(await readCartIdentity()));
  } catch {
    cart = null;
  }
  if (!cart) {
    return (
      <StateMessage
        title="Não conseguimos carregar seu carrinho"
        description="O banco de dados está indisponível no momento. Tente novamente em instantes."
        action={<StateLink href="/produtos">Voltar ao catálogo</StateLink>}
      />
    );
  }

  return (
    <CartView
      initialCart={cart}
      isAuthenticated={(await currentUserId()) !== null}
    />
  );
}
