import type { CartItem } from "@/modules/commerce/domain/cart";

/**
 * Identidade do carrinho: usuário autenticado tem prioridade; visitantes usam
 * uma chave de sessão anônima guardada em cookie.
 */
export interface CartIdentity {
  userId: string | null;
  sessionKey: string | null;
}

export interface CartRepository {
  list(identity: CartIdentity): Promise<CartItem[]>;
  add(identity: CartIdentity, productId: string, quantity: number): Promise<void>;
  setQuantity(
    identity: CartIdentity,
    productId: string,
    quantity: number,
  ): Promise<void>;
  remove(identity: CartIdentity, productId: string): Promise<void>;
  clear(identity: CartIdentity): Promise<void>;
}
