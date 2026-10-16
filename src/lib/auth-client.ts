import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { useSession, signIn, signUp, signOut } = authClient;

/** Evento disparado após qualquer mutação do carrinho, para atualizar o contador. */
export const CART_UPDATED_EVENT = "cart:updated";

export function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}
