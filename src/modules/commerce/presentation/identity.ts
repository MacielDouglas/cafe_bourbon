import { cookies, headers } from "next/headers";
import { auth } from "@/infrastructure/auth/better-auth";
import type { CartIdentity } from "@/modules/commerce/domain/cart-repository";

export const CART_COOKIE = "cb_cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

/** Id do usuário autenticado (Better Auth) ou null para visitantes. */
export async function currentUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Lê a identidade sem criar cookie (uso em leitura de página). */
export async function readCartIdentity(): Promise<CartIdentity> {
  const store = await cookies();
  return {
    userId: await currentUserId(),
    sessionKey: store.get(CART_COOKIE)?.value ?? null,
  };
}

/** Garante um cookie anônimo estável para o carrinho (uso em mutações). */
export async function ensureCartIdentity(): Promise<CartIdentity> {
  const userId = await currentUserId();
  const store = await cookies();
  let sessionKey = store.get(CART_COOKIE)?.value ?? null;

  if (!userId && !sessionKey) {
    sessionKey = crypto.randomUUID();
    store.set(CART_COOKIE, sessionKey, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: CART_COOKIE_MAX_AGE,
    });
  }

  return { userId, sessionKey };
}
