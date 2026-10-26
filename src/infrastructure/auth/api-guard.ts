import {
  type AuthenticatedUser,
  currentUser,
  isOwnerRole,
} from "@/infrastructure/auth/authorization";

export type OwnerGuardResult =
  | { user: AuthenticatedUser; response: null }
  | { user: null; response: Response };

/** Verifica sessão + papel de owner para uso em Route Handlers. */
export async function requireOwnerApi(): Promise<OwnerGuardResult> {
  const user = await currentUser();
  if (!user) {
    return {
      user: null,
      response: Response.json(
        { error: "Autenticação necessária." },
        { status: 401 },
      ),
    };
  }
  if (!isOwnerRole(user.role)) {
    return {
      user: null,
      response: Response.json({ error: "Acesso restrito." }, { status: 403 }),
    };
  }
  return { user, response: null };
}
